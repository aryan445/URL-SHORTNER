import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';

@Injectable()
export class NormalizeUrlBodyPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (metadata.type === 'body' && value) {
      // If 'originalUrl' is sent instead of 'url', normalize it
      if (value.originalUrl && !value.url) {
        value.url = value.originalUrl;
      }
      // Ensure url is a string
      if (value.url && typeof value.url !== 'string') {
        value.url = String(value.url);
      }
    }
    return value;
  }
}
