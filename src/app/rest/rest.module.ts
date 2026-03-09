import { Module } from '@nestjs/common';
import { UrlController } from './url.controller';
import { UrlModule } from '../url/url.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [UrlModule, AuthModule],
  controllers: [UrlController],
})
export class RestModule {}
