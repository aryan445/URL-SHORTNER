import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from '../user/user.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    UserModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const secret =
          config.get<string>('JWT_SECRET') || process.env.JWT_SECRET;
        const resolved =
          secret ||
          ((process.env.NODE_ENV as string) === 'local'
            ? 'dev-secret-change-in-production'
            : undefined);
        if (!resolved) {
          throw new Error(
            'JWT_SECRET is not defined. Add it to .env or set the env var.',
          );
        }
        if (!secret && (process.env.NODE_ENV as string) === 'local') {
          console.warn(
            '[Auth] JWT_SECRET not set; using dev default. Set JWT_SECRET in .env for production.',
          );
        }
        return {
          secret: resolved,
          signOptions: { expiresIn: '7d' },
        };
      },
    }),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
