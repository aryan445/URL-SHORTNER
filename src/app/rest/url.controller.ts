import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Redirect,
  Req,
  UseGuards,
  UseInterceptors,
  Header,
  NotFoundException,
  StreamableFile,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import * as QRCode from 'qrcode';
import { UrlService } from '../url/url.service';
import { UrlReqDto } from './dtos/requests';
import { UrlMapper } from './mappers';
import { RateLimit } from '../rate-limiter/decorator/rate-limit.decorator';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  UrlInfoResDto,
  UrlClickHistoryResDto,
  MyLinksResDto,
  RedirectResponseDto,
  UrlResDto,
} from './dtos/responses';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NormalizeBodyInterceptor } from './interceptors/normalize-body.interceptor';

@ApiTags('URL')
@Controller('url')
export class UrlController {
  private readonly logger = new Logger(UrlController.name);

  constructor(
    private readonly urlService: UrlService,
    private readonly configService: ConfigService,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiResponse({ status: 200, description: 'List my links', type: MyLinksResDto })
  async getMyLinks(
    @Req() req: Request & { user: { id: string; email: string } },
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const l = Math.min(100, parseInt(limit || '20', 10) || 20);
    const o = Math.max(0, parseInt(offset || '0', 10) || 0);
    return this.urlService.findMyLinks(req.user.id, l, o);
  }

  @ApiResponse({
    status: 201,
    description: 'The url has been successfully added.',
    type: UrlResDto,
  })
  @Post()
  @UseInterceptors(NormalizeBodyInterceptor)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @RateLimit(20, 60 * 1000) // 20 requests per minute per IP
  async shortenUrl(
    @Body() createUrlDto: UrlReqDto,
    @Req() req: Request & { user: { id: string; email: string } },
  ): Promise<UrlResDto> {
    try {
      this.logger.log(`Shorten URL request received - Raw body: ${JSON.stringify(req.body)}`);
      this.logger.log(`Parsed DTO: ${JSON.stringify(createUrlDto)}`);
      this.logger.log(`DTO shortKey value: "${createUrlDto.shortKey}" (type: ${typeof createUrlDto.shortKey}, undefined?: ${createUrlDto.shortKey === undefined})`);
      this.logger.log(`User ID: ${req.user.id}`);
      
      const url = UrlMapper.toEntity(createUrlDto);
      url.userId = req.user.id;
      this.logger.log(`Mapped entity: ${JSON.stringify({ originalUrl: url.originalUrl, shortKey: url.shortKey, expiresAt: url.expiresAt, redirectPermanent: url.redirectPermanent, userId: url.userId })}`);
      this.logger.log(`Entity shortKey value: "${url.shortKey}" (will ${url.shortKey ? 'USE CUSTOM' : 'GENERATE RANDOM'})`);
      
      const urlEntity = await this.urlService.create(url);
      this.logger.log(`URL created successfully: ${urlEntity.id}, shortKey: ${urlEntity.shortKey}`);
      
      const response = UrlMapper.toResponseDto(urlEntity);
      this.logger.log(`Response DTO: ${JSON.stringify(response)}`);
      return response;
    } catch (error) {
      this.logger.error(`Error in shortenUrl: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Get(':shortKey/info')
  @ApiResponse({ status: 200, description: 'URL info without redirect', type: UrlInfoResDto })
  async getUrlInfo(@Param('shortKey') shortKey: string) {
    return this.urlService.getUrlInfo(shortKey);
  }

  @Get(':shortKey/qr')
  @Header('Content-Type', 'image/png')
  @ApiResponse({ status: 200, description: 'QR code image (PNG)' })
  async getQr(
    @Param('shortKey') shortKey: string,
    @Req() req: Request,
  ): Promise<StreamableFile> {
    await this.urlService.getUrlInfo(shortKey); // 404 if not found
    const configBaseUrl = this.configService.get<string>('BASE_URL');
    const base = configBaseUrl || `${req.protocol}://${req.get('host') || 'localhost'}`;
    const shortUrl = `${base}/api/url/${shortKey}`;
    const buffer = await QRCode.toBuffer(shortUrl, { type: 'png' });
    return new StreamableFile(buffer as any);
  }

  @Get(':shortKey/clicks')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiResponse({ status: 200, description: 'Click history (owner only)', type: UrlClickHistoryResDto })
  async getClickHistory(
    @Param('shortKey') shortKey: string,
    @Req() req: Request & { user: { id: string; email: string } },
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const l = Math.min(100, parseInt(limit || '50', 10) || 50);
    const o = Math.max(0, parseInt(offset || '0', 10) || 0);
    const result = await this.urlService.getClickHistory(
      shortKey,
      req.user.id,
      l,
      o,
    );
    if (!result) {
      throw new NotFoundException('Short URL not found or access denied');
    }
    return result;
  }

  @ApiResponse({
    status: 200,
    description: 'Redirect to the original URL',
    type: RedirectResponseDto,
  })
  @Get(':shortKey')
  @RateLimit(10, 1 * 60 * 1000) // 10 requests per minute per IP
  @Redirect()
  async redirectToOriginalUrl(@Param('shortKey') shortKey: string) {
    const result = await this.urlService.getOriginalUrl(shortKey);
    if (result) {
      return { url: result.url, statusCode: result.statusCode };
    }
    return { url: '/', statusCode: 302 };
  }
}
