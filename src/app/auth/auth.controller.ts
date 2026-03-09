import { Body, Controller, Post, Logger } from '@nestjs/common';
import { ApiTags, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginReqDto, RegisterReqDto } from '../rest/dtos/requests';
import { LoginResDto, RegisterResDto } from '../rest/dtos/responses';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiResponse({ status: 201, description: 'User registered', type: RegisterResDto })
  async register(@Body() dto: RegisterReqDto) {
    this.logger.log(`Register request received: ${JSON.stringify(dto)}`);
    try {
      const user = await this.authService.register(
        dto.email,
        dto.password,
        dto.firstName || (dto as any).first_name,
        dto.lastName || (dto as any).last_name,
      );
      this.logger.log(`User registered successfully: ${user.id}`);
      return { id: user.id, email: user.email };
    } catch (error) {
      this.logger.error(`Registration failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Post('login')
  @ApiResponse({ status: 200, description: 'Login successful', type: LoginResDto })
  async login(@Body() dto: LoginReqDto) {
    return this.authService.login(dto.email, dto.password);
  }
}
