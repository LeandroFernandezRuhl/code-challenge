import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { UserDto } from './dto/user.dto';
import { FirebaseAdmin } from '../../config/firebase.setup';
import { SignInDto } from './dto/signin.dto';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    private readonly admin: FirebaseAdmin,
    private readonly configService: ConfigService,
  ) {}

  async createUser(userRequest: UserDto): Promise<any> {
    const { email, password, firstName, lastName, role } = userRequest;
    const app = this.admin.setup();

    this.logger.log(`Creating user with email: ${email}`);

    try {
      const createdUser = await app.auth().createUser({
        email,
        password,
        displayName: `${firstName} ${lastName}`,
      });
      this.logger.log(`User created successfully: UID=${createdUser.uid}`);

      await app.auth().setCustomUserClaims(createdUser.uid, { role });
      this.logger.log(
        `Custom claims set for user UID=${createdUser.uid}, role=${role}`,
      );

      return createdUser;
    } catch (error) {
      this.logger.error(
        `Failed to create user with email: ${email}`,
        error.stack,
      );
      throw new BadRequestException('Failed to create user. Please try again.');
    }
  }

  async signInUser(credentials: SignInDto): Promise<any> {
    const { email, password } = credentials;
    const signInUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${this.configService.get<string>('WEB_API_KEY')}`;

    this.logger.log(`Sign-in request for email: ${email}`);

    try {
      const response = await axios.post(signInUrl, {
        email,
        password,
        returnSecureToken: true,
      });

      const { idToken, refreshToken, expiresIn } = response.data;

      this.logger.log(`Sign-in successful for email: ${email}`);
      return {
        idToken,
        refreshToken,
        expiresIn,
      };
    } catch (error) {
      this.logger.error(`Sign-in failed for email: ${email}`, error.stack);
      throw new BadRequestException('Invalid email or password.');
    }
  }
}
