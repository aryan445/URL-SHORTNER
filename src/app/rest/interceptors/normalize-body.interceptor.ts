import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class NormalizeBodyInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    
    // Normalize originalUrl -> url for POST /api/url
    // Check multiple URL patterns since NestJS may strip the prefix
    const isUrlRoute = 
      request.url === '/api/url' || 
      request.url === '/url' ||
      request.originalUrl === '/api/url' ||
      request.originalUrl?.endsWith('/url') ||
      request.path === '/url';
    
    if (request.method === 'POST' && isUrlRoute && request.body) {
      console.log('[Interceptor] URL route detected - URL:', request.url, 'OriginalURL:', request.originalUrl, 'Path:', request.path);
      console.log('[Interceptor] Before normalization:', JSON.stringify(request.body));
      
      if (request.body.originalUrl && !request.body.url) {
        request.body.url = request.body.originalUrl;
        delete request.body.originalUrl;
        console.log('[Interceptor] Converted originalUrl to url');
      }
      
      if (request.body.url && typeof request.body.url === 'string') {
        request.body.url = request.body.url.trim();
      }
      
      console.log('[Interceptor] After normalization:', JSON.stringify(request.body));
    }
    
    return next.handle();
  }
}
