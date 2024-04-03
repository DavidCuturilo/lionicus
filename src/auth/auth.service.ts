import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserDto } from 'src/dto/user.dto';
import { User, UserDocument } from 'src/schemas/user.schema';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import winston_logger from 'src/winston-logger/winston.logger';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
    private jwtService: JwtService,
  ) {}

  async register(user: UserDto) {
    const newUser = {
      email: user.email,
      password: await bcrypt.hash(user.password, 10),
    };
    return await this.userModel.create(newUser);
  }

  async login(user: UserDto) {
    const userData: UserDocument = await this.userModel.findOne({
      email: user.email,
    });

    const userMatch = await bcrypt.compare(user.password, userData?.password);
    if (!userMatch) {
      throw new UnauthorizedException();
    }

    winston_logger.info(`User ${userData.email} successfully logged in`);

    const payload = { sub: userData._id, email: userData.email };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
