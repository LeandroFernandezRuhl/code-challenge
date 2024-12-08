import { Controller, Post, Body } from '@nestjs/common';
import { UserService } from './user.service';
import { UserDto } from './dto/user.dto';
import { SignInDto } from './dto/signin.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('signup')
  signUp(@Body() userRequest: UserDto) {
    return this.userService.createUser(userRequest);
  }

  @Post('signin')
  async signIn(@Body() credentials: SignInDto) {
    return this.userService.signInUser(credentials);
  }
}
