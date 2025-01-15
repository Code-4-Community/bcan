import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(
    @Body('username') username: string,
    @Body('password') password: string,
    @Body('email') email: string,
  ): Promise<{ message: string }> {
    await this.authService.register(username, password, email);
    return { message: 'User registered successfully' };
  }

  @Post('login')
  async login(
    @Body('username') username: string,
    @Body('password') password: string,
  ): Promise<{
    access_token?: string;
    user?: any;
    session?: string;
    challenge?: string;
    requiredAttributes?: string[];
    username?: string;
  }> {
    return await this.authService.login(username, password);
  }

  @Post('set-password')
  async setNewPassword(
    @Body('newPassword') newPassword: string,
    @Body('session') session: string,
    @Body('username') username: string,
    @Body('email') email?: string,
  ): Promise<{ access_token: string }> {
    return await this.authService.setNewPassword(newPassword, session, username, email);
  }

  @Post('update-profile')
  async updateProfile(
    @Body('username') username: string,
    @Body('displayName') displayName : string
  ): Promise<{message: string}> {
    await this.authService.updateProfile(username,displayName)
    return { message: 'Profile has been updated' };

  } 
}