import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';
import { Constants } from '../../utils/constants';
import { UserRole } from 'src/users/models/_user.model';
export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsEnum(UserRole)
  @IsNotEmpty()
  role: string;

  @IsString()
  @Matches(Constants.PHONE_REGX, { message: 'phone is invalid' })
  phone: string;
}
