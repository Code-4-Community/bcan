import { Injectable, CanActivate, ExecutionContext, Logger } from "@nestjs/common";
import { Observable } from "rxjs";
import { CognitoJwtVerifier } from "aws-jwt-verify";




@Injectable()
export class VerifyUserGuard implements CanActivate {
  private verifier: any;
  private readonly logger: Logger;
  constructor() {
    const userPoolId = process.env.COGNITO_USER_POOL_ID;
    this.logger = new Logger(VerifyUserGuard.name);

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
      if (!accessToken) {
        this.logger.error("No access token found in cookies");
        return false;
      }
      const result = await this.verifier.verify(accessToken);

      return true;
    } catch (error) {
      console.error("Token verification failed:", error); // Debug log
      return false;
    }
  }
}

@Injectable()
@Injectable()
export class VerifyAdminRoleGuard implements CanActivate {
  private verifier: any;
  private idVerifier: any;
  private readonly logger: Logger;

  constructor() {
    const userPoolId = process.env.COGNITO_USER_POOL_ID;
    this.logger = new Logger(VerifyAdminRoleGuard.name);

    if (!userPoolId) {
      throw new Error("[AUTH] USER POOL ID is not defined in environment variables");
    }

    this.verifier = CognitoJwtVerifier.create({
      userPoolId,
      tokenUse: "access",
      clientId: process.env.COGNITO_CLIENT_ID,
    });

    this.idVerifier = CognitoJwtVerifier.create({
      userPoolId,
      tokenUse: "id",
      clientId: process.env.COGNITO_CLIENT_ID,
    });
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const request = context.switchToHttp().getRequest();
      const accessToken = request.cookies["access_token"];
      const idToken = request.cookies["id_token"];

      if (!accessToken) {
        this.logger.error("No access token found in cookies");
        return false;
      }

      if (!idToken) {
        this.logger.error("No ID token found in cookies");
        return false;
      }

      const [result, idResult] = await Promise.all([
        this.verifier.verify(accessToken),
        this.idVerifier.verify(idToken),
      ]);

      const groups = result['cognito:groups'] || [];
      const email = idResult['email'];

      if (!email) {
        this.logger.error("No email found in ID token claims");
        return false;
      }

      // Attach user info to request for use in controllers
      request.user = {
        email,
        position: groups.includes('Admin') ? 'Admin' : (groups.includes('Employee') ? 'Employee' : 'Inactive')
      };

      this.logger.log(`User groups from token: ${groups}`);

      if (!groups.includes('Admin')) {
        this.logger.warn("Access denied: User is not an Admin");
        return false;
      }

      return true;
    } catch (error) {
      this.logger.error("Token verification failed:", error);
      return false;
    }
  }
}

@Injectable()
export class VerifyAdminOrEmployeeRoleGuard implements CanActivate {
  private verifier: any;
  private readonly logger: Logger;
  
  constructor() {
    const userPoolId = process.env.COGNITO_USER_POOL_ID;
    this.logger = new Logger(VerifyAdminOrEmployeeRoleGuard.name);
    
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
      
      if (!accessToken) {
        this.logger.error("No access token found in cookies");
        return false;
      }
      
      const result = await this.verifier.verify(accessToken);
      const groups = result['cognito:groups'] || [];
      
      this.logger.log(`User groups from token: ${groups.join(', ')}`);
      
      // Check if user is either Admin or Employee
      const isAuthorized = groups.includes('Admin') || groups.includes('Employee');
      
      if (!isAuthorized) {
        this.logger.warn("Access denied: User is not an Admin or Employee");
        return false;
      }
      
      return true;
      
    } catch (error) {
      this.logger.error("Token verification failed:", error);
      return false;
    }
  }
}
