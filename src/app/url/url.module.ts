import { Module } from '@nestjs/common';
import { urlRepositoryProvider } from './repositories/url.repository';
import { urlClickRepositoryProvider } from './repositories/url-click.repository';
import { UrlService } from './url.service';

@Module({
  imports: [],
  providers: [urlRepositoryProvider, urlClickRepositoryProvider, UrlService],
  exports: [UrlService],
})
export class UrlModule {}
