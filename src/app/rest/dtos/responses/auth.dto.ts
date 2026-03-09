import { ApiResponseProperty } from '@nestjs/swagger';

export class LoginResDto {
  @ApiResponseProperty()
  access_token: string;
}

export class RegisterResDto {
  @ApiResponseProperty()
  id: string;

  @ApiResponseProperty()
  email: string;
}
