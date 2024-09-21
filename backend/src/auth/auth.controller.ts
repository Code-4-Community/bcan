import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('set-password')
  async setNewPassword(
    @Body() body: { newPassword: string; session: string; username: string }
  ): Promise<{ access_token: string }> {
    try {
      // Check incoming parameters
      console.log('New Password:', body.newPassword);
      console.log('Session:', body.session);
      console.log('Username:', body.username);

      return await this.authService.setNewPassword(body.newPassword, body.session, body.username);
    } catch (error) {
      if (error instanceof Error) {
        throw new HttpException(
          { status: HttpStatus.INTERNAL_SERVER_ERROR, error: error.message || 'Failed to set new password' },
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
      throw new HttpException(
        { status: HttpStatus.INTERNAL_SERVER_ERROR, error: 'An unknown error occurred' },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
  
  @Post('login')
  async login(
    @Body() body: { username: string; password: string }
  ): Promise<{ access_token?: string; session?: string; challenge?: string }> {
    try {
      // Return the result from AuthService, which could include a challenge
      return await this.authService.login(body.username, body.password);
    } catch (error) {
      // Handle errors safely
      if (error instanceof Error) {
        throw new HttpException(
          { status: HttpStatus.INTERNAL_SERVER_ERROR, error: error.message || 'Login failed' },
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      } else {
        throw new HttpException(
          { status: HttpStatus.INTERNAL_SERVER_ERROR, error: 'An unknown error occurred' },
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
    }
  }
}