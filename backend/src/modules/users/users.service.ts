import {
  Injectable,
  ConflictException,
  Logger,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { DatabaseService } from '../../core/database/database.service';
import { RegisterDto } from '../auth/dto/register.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private prisma: DatabaseService) {}

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async create(dto: RegisterDto) {
    this.logger.log(`Attempting to create user with email: ${dto.email}`);

    const existingUser = await this.findByEmail(dto.email);
    if (existingUser) {
      this.logger.warn(
        `Registration failed: Email ${dto.email} already exists`,
      );
      throw new ConflictException('Email already registered');
    }

    try {
      const hashedPassword = await bcrypt.hash(dto.password, 10);

      const result = await this.prisma.$transaction(async (tx) => {
        // 1. Create User
        const newUser = await tx.user.create({
          data: {
            email: dto.email,
            password: hashedPassword,
            role: dto.role,
          },
        });

        // 2. Logic Profile
        if (dto.role === 'CANDIDATE') {
          await tx.candidateProfile.create({
            data: { userId: newUser.id, fullName: dto.fullName, skills: [] },
          });
        } else if (dto.role === 'RECRUITER') {
          if (!dto.companyName) {
            throw new BadRequestException(
              'Nama Perusahaan wajib diisi untuk pendaftaran Recruiter.',
            );
          }

          // A. Buat Company TERLEBIH DAHULU
          const newCompany = await tx.company.create({
            data: {
              name: dto.companyName,
              websiteUrl: dto.companyWebsite || null,
            },
          });

          // B. Baru buat Recruiter Profile SEKALI saja, langsung hubungkan ke Company
          await tx.recruiterProfile.create({
            data: {
              userId: newUser.id,
              fullName: dto.fullName,
              companyId: newCompany.id, // Sambungkan ID company yang baru dibuat
            },
          });
        }

        const { password, ...userWithoutPassword } = newUser;
        return userWithoutPassword;
      });

      this.logger.log(
        `User created successfully: ID ${result.id}, Role ${result.role}`,
      );
      return result;
    } catch (error) {
      // Tangkap error spesifik agar tidak tertelan InternalServerErrorException
      if (error instanceof BadRequestException) {
        throw error;
      }

      this.logger.error(`Failed to create user ${dto.email}`, error.stack);
      throw new InternalServerErrorException('Transaction failed');
    }
  }
}
