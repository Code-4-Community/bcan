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

    const oneHourMs = 60 * 60 * 1000;
    res.cookie('app_idToken', result.access_token, {
      httpOnly: true,
      secure: false, // TODO: true in production (HTTPS)
      sameSite: 'strict',
      maxAge: oneHourMs,
    });

    return res.json({
      message: result.message || 'Login Successful!',
      user: result.user,
    });
  }

  @Post('me')
  @HttpCode(200)
  async me(@Req() req: Request) {
    // 1) Retrieve the token from the cookie
    const token = req.cookies['app_idToken'];
    if (!token) {
      throw new UnauthorizedException('No token found');
    }
    // 2) Verify the token. 
    //    - If you're using the Cognito ID token directly, you can skip "jwt.verify()"
    const payload = this.authService.verifyToken(token);

    // 3) Optionally fetch the user and other side effects
    return { user: payload };
  }

  @Post('logout')
  async logout(@Res() res: Response) {
    // Clear the token cookie
    res.clearCookie('app_idToken');
    return res.json({ message: 'Logged out' });
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