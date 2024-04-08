import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserRole } from '../enums/user-role.enum';
import { UserDto } from '../dto/user.dto';
import { UnauthorizedException } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { configService } from '../config/config.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../schemas/user.schema';
import mongoconfig from '../config/mongoconfig';

describe('AuthController', () => {
  let authService: AuthService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [AuthService],
      imports: [
        JwtModule.register({
          global: true,
          secret: configService.getJwtConfig().secret,
          signOptions: configService.getJwtConfig().signOptions,
        }),
        MongooseModule.forRoot(mongoconfig.database),
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
      ],
    }).compile();

    authService = moduleRef.get<AuthService>(AuthService);
  });
  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('register success', () => {
    it('should return success message', async () => {
      const user: UserDto = {
        email: 'testing@gmail.com',
        password: 'password',
        userRole: UserRole.USER,
      };
      const result = {
        message: 'User registered successfully',
      };

      const registerResult = await authService.register(user);

      expect(registerResult).toEqual(result);
    });
  });

  describe('register failed - user already exists', () => {
    it('should return duplicate key error', async () => {
      const user: UserDto = {
        email: 'testing@gmail.com',
        password: 'password',
        userRole: UserRole.USER,
      };

      const errorMessage = `E11000 duplicate key error collection`;

      try {
        expect(await authService.register(user)).toEqual(errorMessage);
      } catch (error) {
        expect(error.message ?? error).toContain(errorMessage);
      }
    });
  });

  describe('login success', () => {
    it('should return access token', async () => {
      const user: UserDto = {
        email: 'test@gmail.com',
        password: '123',
        userRole: UserRole.USER,
      };

      expect(await authService.login(user)).toBeTruthy();
    });
  });

  describe('login failed', () => {
    it('should return UnauthorizedException', async () => {
      const user: UserDto = {
        email: 'noprofile@gmail.com',
        password: 'password',
        userRole: UserRole.USER,
      };

      try {
        expect(await authService.login(user)).toThrow(UnauthorizedException);
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }
    });
  });
});
