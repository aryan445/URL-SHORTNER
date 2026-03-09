import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Length,
  Matches,
  Max,
  Min,
} from 'class-validator';

export class UrlReqDto {
  @ApiProperty({ required: true, description: 'The long URL to shorten' })
  @Transform(({ value, obj }) => {
    // Handle both 'url' and 'originalUrl' field names from frontend
    // obj contains the entire request body
    let urlValue = value;
    
    // If url field is missing but originalUrl exists, use originalUrl
    if ((!urlValue || urlValue === undefined || urlValue === null) && obj?.originalUrl) {
      urlValue = obj.originalUrl;
      // Also update the object so other validators see it
      obj.url = obj.originalUrl;
    }
    
    if (!urlValue) {
      return value; // Return undefined to let validation catch it
    }
    
    // Convert to string and trim
    const trimmed = typeof urlValue === 'string' ? urlValue.trim() : String(urlValue).trim();
    
    // Ensure it starts with http:// or https://
    if (trimmed && !trimmed.match(/^https?:\/\//i)) {
      // If no protocol, assume https
      const withProtocol = `https://${trimmed}`;
      if (obj) obj.url = withProtocol;
      return withProtocol;
    }
    
    // Update obj.url so validation sees the correct value
    if (obj) obj.url = trimmed;
    return trimmed;
  })
  @IsString({ message: 'url must be a string' })
  @IsNotEmpty({ message: 'url should not be empty' })
  @IsUrl(
    {
      require_protocol: true,
      protocols: ['http', 'https'],
    },
    { message: 'url must be a valid URL address (e.g., https://example.com)' },
  )
  url: string;

  @ApiPropertyOptional({
    description:
      'Custom short key (3–32 chars, letters, numbers, hyphen, underscore). If omitted or empty, one is generated.',
    example: 'my-brand',
    minLength: 3,
    maxLength: 32,
  })
  @IsOptional()
  @IsString()
  @Length(3, 32, {
    message: 'shortKey must be between 3 and 32 characters',
  })
  @Matches(/^[a-zA-Z0-9_-]+$/, {
    message: 'shortKey must contain only letters, numbers, hyphens, and underscores',
  })
  @Transform(({ value }) => {
    // Handle empty strings, null, undefined - convert to undefined so it's treated as omitted
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return undefined;
    }
    return typeof value === 'string' ? value.trim() : value;
  })
  shortKey?: string;

  @ApiPropertyOptional({
    description:
      'Days until the link expires. 0 = never expire. Omitted = 1 day. Allowed: 0–365.',
    example: 7,
    minimum: 0,
    maximum: 365,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(365)
  expiresInDays?: number;

  @ApiPropertyOptional({
    description: 'Use 301 (permanent) redirect instead of 302 (temporary). Better for SEO when the short URL is permanent.',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  permanent?: boolean;
}
