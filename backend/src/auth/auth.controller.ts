import { Controller, Post, Body, Get, Req, Res, UseGuards, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { User } from '../types/User';
import { Response } from 'express';
import { VerifyUserGuard } from "../guards/auth.guard";
import { LoginBody, RegisterBody, SetPasswordBody, UpdateProfileBody } from './types/auth.types';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Checks if the user has a valid session
   */
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

  /**
   * 
   * Register user
   */
  @Post('register')
  @ApiResponse({
    status : 201,
    description : "User registered successfully"
  })
  @ApiResponse({
    status: 500,
    description : "Internal Server Error"
  })
  @ApiResponse({
    status : 400,
    description : "{Error encountered}"}
  )
  @ApiResponse({
    status: 409,
    description : "{Error encountered}"
  })

  async register(
   @Body() body: RegisterBody
  ): Promise<{ message: string }> {
    await this.authService.register(body.username, body.password, body.email);
    return { message: 'User registered successfully' };
  }
  
  /**
   * Logs in a user
   */
  @Post('login')
  @ApiResponse({
    status: 200,
    description: "User logged in successfully"
  })
  @ApiResponse({
    status: 400,
    description: "{Error encountered}"
  })
  @ApiResponse({
    status: 401,
    description: "Invalid credentials"
  })
  @ApiResponse({
    status: 500,
    description: "Internal server error"
  })
  
  async login(
    @Res({ passthrough: true }) response: Response,
    @Body() body:LoginBody
  ): Promise<{
    user: User;
    session?: string;
    challenge?: string;
    requiredAttributes?: string[];
    username?: string;
    position?: string;
  }> {
    const result = await this.authService.login(body.username, body.password);
  
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

  /**
   * 
   * Set new password
   */
  @Post('set-password')
  @UseGuards(VerifyUserGuard)
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: "Password set successfully"
  })
  @ApiResponse({
    status: 400,
    description: "{Error encountered}"
  })
  @ApiResponse({
    status: 401,
    description: "Invalid credentials"
  })
  @ApiResponse({
    status: 500,
    description: "Internal server error"
  })

  async setNewPassword(
    @Body() body: SetPasswordBody
  ): Promise<{ message: string }> {
    await this.authService.setNewPassword(body.newPassword, body.session, body.username, body.email);
    return { message: 'Password has been set successfully' };
  }

  /**
   * 
   * Update user profile for username, email, and position_or_role
   */
    @Post('update-profile')
    @UseGuards(VerifyUserGuard)
    @ApiBearerAuth()
    @ApiResponse({
    status: 200,
    description: "Profile updated successfully"
  })
  @ApiResponse({
    status: 400,
    description: "{Error encountered}"
  })
  @ApiResponse({
    status: 401,
    description: "Invalid credentials"
  })
  @ApiResponse({
    status: 500,
    description: "Internal server error"
  })

    async updateProfile(
      @Body() body: UpdateProfileBody
    ): Promise<{ message: string }> {
      await this.authService.updateProfile(body.username, body.email, body.position_or_role);
      return { message: 'Profile has been updated' };
    }

    
    
    
  
  
}