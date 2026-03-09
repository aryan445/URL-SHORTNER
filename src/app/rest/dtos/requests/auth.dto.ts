import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterReqDto {
  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  email: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @Transform(({ value, obj }) => {
    // Handle both firstName (camelCase) and first_name (snake_case)
    const val = value || obj?.first_name;
    return typeof val === 'string' ? val.trim() : val;
  })
  firstName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @Transform(({ value, obj }) => {
    // Handle both lastName (camelCase) and last_name (snake_case)
    const val = value || obj?.last_name;
    return typeof val === 'string' ? val.trim() : val;
  })
  lastName?: string;

  @ApiProperty({ minLength: 6 })
  @IsString()
  @MinLength(6)
  password: string;
}

export class LoginReqDto {
  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  password: string;
}
