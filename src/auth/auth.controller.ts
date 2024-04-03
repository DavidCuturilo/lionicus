import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { Roles } from 'src/decorators/user-role.decorator';
import { UserDto } from 'src/dto/user.dto';
import { UserRole } from 'src/enums/user-role.enum';
import { AuthGuard } from 'src/guards/auth.guard';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() user: UserDto) {
    return this.authService.register(user);
  }

  @Post('login')
  async login(@Body() user: UserDto) {
    return this.authService.login(user);
  }

  @UseGuards(AuthGuard)
  @Roles(UserRole.USER)
  @Get('test')
  async test(@Request() req) {
    return req.email;
  }
}
