import {
  Injectable,
  ConflictException,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { DatabaseService } from '../../core/database/database.service';
import { RegisterDto } from '../auth/dto/register.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  // 1. Inisialisasi Logger
  private readonly logger = new Logger(UsersService.name);

  constructor(private prisma: DatabaseService) {}

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async create(dto: RegisterDto) {
    this.logger.log(`Attempting to create user with email: ${dto.email}`); // Audit Trail: Attempt

    const existingUser = await this.findByEmail(dto.email);
    if (existingUser) {
      this.logger.warn(
        `Registration failed: Email ${dto.email} already exists`,
      ); // Audit Trail: Warning
      throw new ConflictException('Email already registered');
    }

    try {
      const hashedPassword = await bcrypt.hash(dto.password, 10);

      const result = await this.prisma.$transaction(async (tx) => {
        const newUser = await tx.user.create({
          data: {
            email: dto.email,
            password: hashedPassword,
            role: dto.role,
          },
        });

        if (dto.role === 'CANDIDATE') {
          await tx.candidateProfile.create({
            data: { userId: newUser.id, fullName: dto.fullName, skills: [] },
          });
        } else if (dto.role === 'RECRUITER') {
          await tx.recruiterProfile.create({
            data: { userId: newUser.id, fullName: dto.fullName },
          });
        }

        const { password, ...userWithoutPassword } = newUser;
        return userWithoutPassword;
      });

      this.logger.log(
        `User created successfully: ID ${result.id}, Role ${result.role}`,
      ); // Audit Trail: Success
      return result;
    } catch (error) {
      this.logger.error(`Failed to create user ${dto.email}`, error.stack); // Audit Trail: Error
      throw new InternalServerErrorException('Transaction failed');
    }
  }
}
