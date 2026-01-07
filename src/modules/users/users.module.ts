import { Module } from '@nestjs/common';
import { UserRepository } from './repositories/user.repository';
import { UsersService } from './services/users.service';

@Module({
  providers: [UsersService, UserRepository],
  exports: [UsersService, UserRepository],
})
export class UsersModule {}
