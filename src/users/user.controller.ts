import { Controller, Post, Body, Logger } from '@nestjs/common';
import { UserService } from './user.service';
import { UserDto } from './dto/user.dto';
import { SignInDto } from './dto/signin.dto';

@Controller('user')
export class UserController {
  private readonly logger = new Logger(UserController.name);

  constructor(private readonly userService: UserService) {}

  @Post('signup')
  async signUp(@Body() userRequest: UserDto) {
    this.logger.log(`Signup request received for email: ${userRequest.email}`);
    try {
      const result = await this.userService.createUser(userRequest);
      this.logger.log(
        `User successfully signed up with email: ${userRequest.email}`,
      );
      return result;
    } catch (error) {
      this.logger.error(
        `Failed to sign up user with email: ${userRequest.email}`,
        error.stack,
      );
      throw error;
    }
  }

  @Post('signin')
  async signIn(@Body() credentials: SignInDto) {
    this.logger.log(`Signin request received for email: ${credentials.email}`);
    try {
      const result = await this.userService.signInUser(credentials);
      this.logger.log(
        `User successfully signed in with email: ${credentials.email}`,
      );
      return result;
    } catch (error) {
      this.logger.error(
        `Failed to sign in user with email: ${credentials.email}`,
        error.stack,
      );
      throw error;
    }
  }
}
