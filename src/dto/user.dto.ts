import {
  IsDefined,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';
import { UserRole } from 'src/enums/user-role.enum';

export class UserDto {
  @IsEmail()
  @IsDefined()
  email: string;

  @IsString()
  @IsDefined()
  password: string;

  @IsEnum(UserRole)
  @IsOptional()
  userRole: UserRole;
}
