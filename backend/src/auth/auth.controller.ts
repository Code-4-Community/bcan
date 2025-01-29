import {
  Controller,
  Post,
  Body,
  Res,
  Req,
  UnauthorizedException,
  HttpCode,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response, Request } from 'express';

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

  /**
   * Logs a user in, maintaining their authstate for 
   */
  @Post('login')
  async login(
    @Body('username') username: string,
    @Body('password') password: string,
    @Res() res: Response,
  ) {
    const result = await this.authService.login(username, password);
    
    if (!result.access_token) {
      return res.status(200).json(result);
    }

    if (result.access_token) {
      // Set HTTP-secure session cookies to expire only in the context of our website
      // Cookie age is calculated in terms of milliseconds
      res.cookie('app_idToken', result.access_token, {
        httpOnly: true,
        secure: false, // TODO: true in production (HTTPS)
        sameSite: 'strict',
        maxAge: 60 * 60 * 1000,
      });

      return res.json({
        message: result.message || 'Login Successful!',
        user: result.user,
      });
    }
  }

  /**
   * Verify active authentication sessions
   * @param req Express request object containing the session token authenticating a user
   * @returns JWT claims (e.g. authenticated session tokens)
   * @throws If the user does not have a valid session token (malicious or errenous attempt)
   */
  @Post('verify-session')
  @HttpCode(200)
  async verifySession(@Req() req: Request) {
    const token = req.cookies['app_idToken'];
    console.log(token)
    if (!token) throw new UnauthorizedException('No token found');
    try {
      const payload = this.authService.verifyToken(token);
      return { authenticatedUserData: { userId: payload.userId, email: payload.email } };
    } catch (err) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  @Post('logout')
  async logout(@Res() res: Response) {
    res.cookie('app_idToken', '');
  }

  @Post('set-password')
  async setNewPassword(
    @Body('newPassword') newPassword: string,
    @Body('session') session: string,
    @Body('username') username: string,
    @Res() res: Response,
    @Body('email') email?: string,
  ) {
    const result = await this.authService.setNewPassword(newPassword, session, username, email);
  
    // If there's an access_token, set it in an HTTP-only cookie 
    if (result.access_token) {
      res.cookie('app_idToken', result.access_token, {
        httpOnly: true,
        secure: false, // set to true in production with HTTPS
        sameSite: 'strict',
        maxAge: 60 * 60 * 1000,
      });
      return res.json({
        message: result.message,
      });
    }
  }
  

  // TODO: Better security
  @Post('update-profile')
  async updateProfile(
    @Body('username') username: string,
    @Body('displayName') displayName : string
  ): Promise<{message: string}> {
    await this.authService.updateProfile(username,displayName)
    return { message: 'Profile has been updated' };

  } 
}