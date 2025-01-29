import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import * as fs from 'fs';
import * as path from 'path';

@Module({
  imports: [
    // Register our encrpytion keys for sensitive user data verification tasks
    JwtModule.register({
      privateKey: fs.readFileSync(
        path.join(__dirname, '../../../backend/keys/private.pem'), 
        'utf8'
      ),
      publicKey: fs.readFileSync(
        path.join(__dirname, '../../../backend/keys/public.pem'), 
        'utf8'
      ),
      // Use the RS256 algorithm, with 1 hour expiration on signed tokens
      signOptions: {
        algorithm: 'RS256',
        expiresIn: '1h',
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}