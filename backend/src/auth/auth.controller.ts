import { Controller, Post, Body, Get, Req, Res, UseGuards, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response } from 'express';
import { VerifyUserGuard } from "../guards/auth.guard";
import { LoginBody, RegisterBody, SetPasswordBody, UpdateProfileBody, ChangePasswordBody } from './types/auth.types';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { User } from '../../../middle-layer/types/User';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Checks if the user has a valid session
   */
  @Get('session')
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: "Session is valid"
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
    description: "Internal Server Error"
  })
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
    await this.authService.register(body.email, body.password,body.firstName,body.lastName);
    return { message: 'User registered successfully' };
  }
  
  /**
   * Logs out a user by clearing authentication cookies
   */
  @Post('logout')
  @ApiResponse({
    status: 200,
    description: "User logged out successfully"
  })
  @ApiResponse({
    status: 500,
    description: "Internal Server Error"
  })
  async logout(
    @Res({ passthrough: true }) response: Response,
    @Req() req: any
  ): Promise<{ message: string }> {
    const cookieToken = req.cookies?.access_token;  
    let token: string | undefined = cookieToken;  

    if (!token) {  
      const authHeader = req.headers['authorization'] || req.headers['Authorization'];  
      if (authHeader && typeof authHeader === 'string') {  
        token = authHeader.startsWith('Bearer ')  
          ? authHeader.substring(7)  
          : authHeader;  
      }  
    }  

    // Logout user in Cognito
    if (token) {  
      await this.authService.logout(token);
    }

    // Clear all cookies
    response.clearCookie('access_token', { path: '/' });
    response.clearCookie('refresh_token', { path: '/auth/refresh' });
    response.clearCookie('id_token', { path: '/' });
    
    return { message: 'Logged out successfully' };
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
  ): Promise<{ message: string; user: User }> {
    const result = await this.authService.login(body.email, body.password);
  
  const isProduction = process.env.NODE_ENV === 'production';

  // Set cookie with access token
  if (result.access_token) {
    response.cookie('access_token', result.access_token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: 3600000,
      path: '/',
    });
  }

  response.clearCookie('refresh_token', { path: '/auth/refresh' });

  if (result.refreshToken) {
    const refreshPayload = JSON.stringify({ username: result.user.email, token: result.refreshToken });
    response.cookie('refresh_token', refreshPayload, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000,
      path: '/auth/refresh',
    });
  }

  if (result.idToken) {
    response.cookie('id_token', result.idToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: 3600000,
      path: '/',
    });
  }

  
  return {
    message: 'User logged in successfully',
    user: result.user,
  };
  }

  /**
   * Refreshes the access token and id token using the refresh token
   */
  @Post('refresh')
  @ApiResponse({
    status: 200,
    description: "Tokens refreshed successfully"
  })
  @ApiResponse({
    status: 401,
    description: "Refresh token missing or expired"
  })
  @ApiResponse({
    status: 500,
    description: "Internal Server Error"
  })
  async refresh(
    @Req() req: any,
    @Res({ passthrough: true}) response: Response,
  ): Promise<{ message: string }> {

    const rawRefreshCookie = req.cookies?.refresh_token;

    if (!rawRefreshCookie) {
      throw new UnauthorizedException('Missing refresh token cookie');
    }

    let cognitoUsername: string;
    let refreshToken: string;
    try {
      const parsed = JSON.parse(rawRefreshCookie);
      cognitoUsername = parsed.username;
      refreshToken = parsed.token;
    } catch {
      throw new UnauthorizedException('Malformed refresh token cookie');
    }

    if (!cognitoUsername || !refreshToken) {
      throw new UnauthorizedException('Could not extract user identity from refresh token');
    }

    const { accessToken, idToken: newIdToken, refreshToken: newRefreshToken } =
      await this.authService.refreshTokens(refreshToken, cognitoUsername);

    // Cognito may or may not rotate refresh tokens depending on configuration.
    // To keep frontend contract stable, we always return the refresh token we're using.
    const effectiveRefreshToken = newRefreshToken ?? refreshToken;

    const isProduction = process.env.NODE_ENV === 'production';

    response.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: 3600000,
      path: '/',
    });

    response.cookie('id_token', newIdToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: 3600000,
      path: '/',
    });

    const newRefreshPayload = JSON.stringify({ username: cognitoUsername, token: effectiveRefreshToken });
    response.cookie('refresh_token', newRefreshPayload, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000,
      path: '/auth/refresh',
    });

    return { message: 'Tokens refreshed successfully' };
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
    await this.authService.setNewPassword(body.newPassword, body.session, body.email);
    return { message: 'Password has been set successfully' };
  }

  /**
   * Change password for a logged-in user
   */
  @Post('change-password')
  @UseGuards(VerifyUserGuard)
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: "Password changed successfully"
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
  async changePassword(
    @Req() req: any,
    @Body() body: ChangePasswordBody
  ): Promise<{ message: string }> {
    let accessToken: string | undefined = req.cookies?.access_token;

    if (!accessToken) {
      const authHeader =
        req.headers["authorization"] || req.headers["Authorization"];
      if (authHeader && typeof authHeader === "string") {
        accessToken = authHeader.startsWith("Bearer ")
          ? authHeader.substring(7)
          : authHeader;
      }
    }

    if (!accessToken) {
      throw new UnauthorizedException("Missing access token");
    }

    await this.authService.changePassword(
      accessToken,
      body.currentPassword,
      body.newPassword,
    );
    return { message: "Password has been changed successfully" };
  }

  /**
   * Update user profile for email, and position_or_role
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
      @Req() req: any,
      @Body() body: UpdateProfileBody
    ): Promise<{ message: string }> {
      let accessToken: string | undefined = req.cookies?.access_token;

      if (!accessToken) {
        const authHeader =
          req.headers["authorization"] || req.headers["Authorization"];
        if (authHeader && typeof authHeader === "string") {
          accessToken = authHeader.startsWith("Bearer ")
            ? authHeader.substring(7)
            : authHeader;
        }
      }

      if (!accessToken) {
        throw new UnauthorizedException("Missing access token");
      }

      await this.authService.updateProfile(
        accessToken,
        body.email,
        body.firstName,
        body.lastName,
      );
      return { message: "Profile has been updated" };
    }

    
    
    
  
  
}