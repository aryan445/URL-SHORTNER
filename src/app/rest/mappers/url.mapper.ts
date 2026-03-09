import { Url } from 'src/app/url/entities';
import { UrlReqDto } from '../dtos/requests';
import { UrlResDto } from '../dtos/responses';

export class UrlMapper {
  static toEntity(urlDto: UrlReqDto): Url {
    const url = new Url();
    url.originalUrl = urlDto.url;

    // Explicitly check for shortKey - preserve it if provided
    if (urlDto.shortKey !== undefined && urlDto.shortKey !== null && urlDto.shortKey.trim() !== '') {
      url.shortKey = urlDto.shortKey.trim();
    }

    url.redirectPermanent = urlDto.permanent ?? false;

    if (urlDto.expiresInDays === undefined || urlDto.expiresInDays === null) {
      url.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // default 1 day
    } else if (urlDto.expiresInDays === 0) {
      url.expiresAt = null;
    } else {
      url.expiresAt = new Date(
        Date.now() + urlDto.expiresInDays * 24 * 60 * 60 * 1000,
      );
    }

    return url;
  }

  static toResponseDto(urlEntity: Url): UrlResDto {
    return {
      id: urlEntity.id,
      shortUrlKey: urlEntity.shortKey,
      shortKey: urlEntity.shortKey, // Alias for frontend compatibility
    };
  }
}
