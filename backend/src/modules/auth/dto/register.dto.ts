import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsEnum,
  IsOptional,
  ValidateIf,
} from 'class-validator';
import { Role } from '../../../../generated/prisma/client';

export class RegisterDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsNotEmpty()
  @IsString()
  fullName: string;

  @IsEnum(Role)
  role: Role;

  // --- Logic Baru: Company Info ---
  // Field ini Wajib jika Role = RECRUITER
  @ValidateIf((o) => o.role === 'RECRUITER')
  @IsNotEmpty({ message: 'Nama Perusahaan wajib diisi untuk Recruiter' })
  @IsString()
  companyName?: string;

  @IsOptional()
  @IsString()
  companyWebsite?: string;
}
