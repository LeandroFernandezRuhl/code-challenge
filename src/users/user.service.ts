import { Injectable, BadRequestException } from '@nestjs/common';
import { UserDto } from './dto/user.dto';
import { FirebaseAdmin } from '../../config/firebase.setup';
import { SignInDto } from './dto/signin.dto';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UserService {
  constructor(
    private readonly admin: FirebaseAdmin,
    private readonly configService: ConfigService,
  ) {}

  async createUser(userRequest: UserDto): Promise<any> {
    const { email, password, firstName, lastName, role } = userRequest;
    const app = this.admin.setup();

    try {
      const createdUser = await app.auth().createUser({
        email,
        password,
        displayName: `${firstName} ${lastName}`,
      });
      await app.auth().setCustomUserClaims(createdUser.uid, { role });
      return createdUser;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async signInUser(credentials: SignInDto): Promise<any> {
    const { email, password } = credentials;
    const signInUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${this.configService.get<string>('WEB_API_KEY')}`;

    try {
      const response = await axios.post(signInUrl, {
        email,
        password,
        returnSecureToken: true,
      });

      const { idToken, refreshToken, expiresIn } = response.data;

      return {
        idToken,
        refreshToken,
        expiresIn,
      };
    } catch (error) {
      console.error('Sign-in error:', error);
      throw new BadRequestException('Invalid email or password.');
    }
  }
}
