import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsEnum,
} from 'class-validator';
import { Role } from '../../../../generated/prisma/client';

export class RegisterDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  password: string;

  @IsNotEmpty()
  @IsString()
  fullName: string;

  @IsEnum(Role)
  role: Role; // 'CANDIDATE' atau 'RECRUITER'
}
