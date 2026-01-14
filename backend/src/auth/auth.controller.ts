import { Controller, Post, Body, Get, Req, Res, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { User } from '../types/User';
import { Response } from 'express';
import { UserStatus } from '../../../middle-layer/types/UserStatus';

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
    @Res({ passthrough: true }) response: Response,
    @Body('username') username: string,
    @Body('password') password: string, 
  ): Promise<{
    user: User;
    session?: string;
    challenge?: string;
    requiredAttributes?: string[];
    username?: string;
    position?: string;
  }> {
    const result = await this.authService.login(username, password);
  
  // Set cookie with access token
  if (result.access_token) {
    response.cookie('access_token', result.access_token, {
      httpOnly: true,      // Cannot be accessed by JavaScript (XSS protection)
      secure: process.env.NODE_ENV === 'production', // Only HTTPS in production
      sameSite: 'strict',  // CSRF protection
      maxAge: 3600000,     // 1 hour in milliseconds
      path: '/',           // Cookie available on all routes
    });
  }
  delete result.access_token;
    return result
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