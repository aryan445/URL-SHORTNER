import { ApiResponseProperty } from '@nestjs/swagger';

export class UrlResDto {
  @ApiResponseProperty()
  id: string;

  @ApiResponseProperty()
  shortUrlKey: string;

  @ApiResponseProperty()
  shortKey: string; // Alias for shortUrlKey for frontend compatibility
}

export class RedirectResponseDto {
  @ApiResponseProperty()
  url: string;

  @ApiResponseProperty()
  statusCode: number;
}

export class UrlInfoResDto {
  @ApiResponseProperty()
  originalUrl: string;

  @ApiResponseProperty()
  shortKey: string;

  @ApiResponseProperty()
  clicks: number;

  @ApiResponseProperty()
  createdAt: Date;

  @ApiResponseProperty()
  expiresAt: Date | null;

  @ApiResponseProperty()
  lastClickedAt: Date | null;

  @ApiResponseProperty()
  redirectPermanent: boolean;
}

export class UrlClickItemDto {
  @ApiResponseProperty()
  clickedAt: Date;
}

export class UrlClickHistoryResDto {
  @ApiResponseProperty({ type: [UrlClickItemDto] })
  data: UrlClickItemDto[];

  @ApiResponseProperty()
  total: number;
}

export class MyLinkItemDto {
  @ApiResponseProperty()
  id: string;

  @ApiResponseProperty()
  shortUrlKey: string;

  @ApiResponseProperty()
  originalUrl: string;

  @ApiResponseProperty()
  clicks: number;

  @ApiResponseProperty()
  createdAt: Date;

  @ApiResponseProperty()
  expiresAt: Date | null;
}

export class MyLinksResDto {
  @ApiResponseProperty({ type: [MyLinkItemDto] })
  data: MyLinkItemDto[];

  @ApiResponseProperty()
  total: number;
}
