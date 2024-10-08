# HELLO! This is backend, NestJS' name is quite literal here.

## nest g (desired file type) (desired directory path) : this command, when ran while in the backend/ path in your terminal working directory, will generate the file type to that directory and create the path if it does not exist. This is useful when creating a feature as this is essentially you creating a feature path for associated code.

/**
nest g module auth
nest g controller auth
nest g service auth

nest g module user
nest g controller user
nest g service user

This will generate:
	•	auth/ folder with auth.controller.ts, auth.module.ts, auth.service.ts.
	•	user/ folder with user.controller.ts, user.module.ts, user.service.ts.
**/

## Module

Here we have an example module for authentication:

```
@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
```

1. This module defines a dependency import on the JwtModule.
2. We pass it some configuration, and define our service call(s) and control mechanism (controller) logic.

## Controller

```
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async getAllUsers() {
    return await this.userService.getAllUsers();
  }

  @Get(':id')
  async getUserById(@Param('id') userId: string) {
    return await this.userService.getUserById(userId);
  }
}
```

Here we have a controller in nest. This controller for user simply allows you to retrieve all users via what the user service provides us, and grab a user based on ID. That way we reduce the number of changes needed to this file, as long as service supports the params and expected return types properly.

## Service

Looks like now we just need to figure out how to actually grab users, or what that even means.

We can define the service call as:

```
  async getAllUsers(): Promise<any> {
    const params = {
      TableName: process.env.DYNAMODB_USER_TABLE_NAME || 'TABLE_FAILURE',
    };

    try {
      const data = await dynamodb.scan(params).promise();
      return data.Items;
    } catch (error) {
      throw new Error('Could not retrieve users');
    }
  }
```

This uses some secrets, the aws sdk, and try catch tolerance to try and grab database stored users!
