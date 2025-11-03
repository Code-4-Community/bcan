import { Controller, Post, Body, Get, Req, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('session')
  async getSession(@Req() req: any) {
    try {
      const authHeader = req.headers['authorization'] || req.headers['Authorization'];
      
      if (!authHeader) {
        throw new UnauthorizedException('No active session');
      }

      const token = authHeader.startsWith('Bearer ') 
        ? authHeader.substring(7) 
        : authHeader;
      
      const user = await this.authService.validateSession(token);
      
      return {
        user,
        message: 'Session valid'
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired session');
    }
  }

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
      @Body('email') email: string,
      @Body('position_or_role') position_or_role: string
    ): Promise<{ message: string }> {
      await this.authService.updateProfile(username, email, position_or_role);
      return { message: 'Profile has been updated' };
    }  
}