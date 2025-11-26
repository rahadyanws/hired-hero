import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { JobType, WorkMode } from '../../../../generated/prisma/client'; // Import Enum dari Prisma

export class CreateJobDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  requirements: string; // Penting untuk AI nanti

  @IsEnum(JobType)
  @IsOptional()
  type?: JobType; // Default FULL_TIME

  @IsEnum(WorkMode)
  @IsOptional()
  workMode?: WorkMode; // Default ONSITE

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsOptional()
  salaryRange?: string;

  // Catatan: companyId bisa kita ambil otomatis jika Recruiter sudah terhubung dengan Company
  // Untuk studi kasus ini, kita asumsikan Recruiter membuat Job dulu baru Company, atau kita buat Company dummy.
  // Tapi di schema, Job butuh CompanyId.
  // SEMENTARA: Kita akan buat Job ini terhubung ke Company 'Dummy' atau biarkan user input companyId manual dulu.

  // @IsString()
  // @IsNotEmpty()
  // companyId: string;
}
