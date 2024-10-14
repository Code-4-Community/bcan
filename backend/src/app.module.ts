import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { GrantModule } from './grant/grant.module';

@Module({
  imports: [AuthModule, UserModule, GrantModule],
})
export class AppModule {}