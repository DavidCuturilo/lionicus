import { IsDefined, IsEmail, IsString } from 'class-validator';

export class UserDto {
  @IsEmail()
  @IsDefined()
  email: string;

  @IsString()
  @IsDefined()
  password: string;
}
