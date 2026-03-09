import { Module } from '@nestjs/common';
import { userRepositoryProvider } from './repositories/user.repository';
import { UserService } from './user.service';

@Module({
  imports: [],
  providers: [userRepositoryProvider, UserService],
  exports: [UserService],
})
export class UserModule {}
