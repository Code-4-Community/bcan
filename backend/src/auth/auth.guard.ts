import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";
import { Observable } from "rxjs";
import { CognitoJwtVerifier } from "aws-jwt-verify";




@Injectable()
export class VerifyUserGuard implements CanActivate {
  private verifier: any;
  constructor() {
    const userPoolId = process.env.COGNITO_USER_POOL_ID;
    if (userPoolId) {
      this.verifier = CognitoJwtVerifier.create({
        userPoolId,
        tokenUse: "access",
        clientId: process.env.COGNITO_CLIENT_ID,
      });
    } else {
      throw new Error(
        "[AUTH] USER POOL ID is not defined in environment variables"
      );
    }
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const request = context.switchToHttp().getRequest();
      const accessToken = request.cookies["access_token"];
      const result = await this.verifier.verify(accessToken);

      return true;
    } catch (error) {
      console.error("Token verification failed:", error); // Debug log
      return false;
    }
  }
}

@Injectable()
export class VerifyAdminRoleGuard implements CanActivate {
  private verifier: any;
  constructor() {
    const userPoolId = process.env.COGNITO_USER_POOL_ID;
    if (userPoolId) {
      this.verifier = CognitoJwtVerifier.create({
        userPoolId,
        tokenUse: "access",
        clientId: process.env.COGNITO_CLIENT_ID,
      });
    } else {
      throw new Error(
        "[AUTH] USER POOL ID is not defined in environment variables"
      );
    }
  }
  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const request = context.switchToHttp().getRequest();
      const accessToken = request.cookies["access_token"];
      const result = await this.verifier.verify(accessToken);
      const groups = result['cognito:groups'] || [];
      console.log("User groups from token:", groups); 
      if (!groups.includes('Admin')) {
        console.warn("Access denied: User is not an Admin");
        return false;
      } else { 
        return true;
      }

    } catch (error) {
      console.error("Token verification failed:", error); // Debug log
      return false;
    }
  }
}
