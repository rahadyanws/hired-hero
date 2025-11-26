import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { DatabaseService } from '../../core/database/database.service';
import { CreateJobDto } from './dto/create-job.dto';

@Injectable()
export class JobsService {
  private readonly logger = new Logger(JobsService.name);

  constructor(private prisma: DatabaseService) {}

  // 1. Create Job
  async create(user: any, dto: CreateJobDto) {
    this.logger.log(`Recruiter ${user.email} creating a new job: ${dto.title}`);

    // Kita perlu ID RecruiterProfile untuk relasi ke Job.
    // User -> RecruiterProfile -> Job
    const recruiterProfile = await this.prisma.recruiterProfile.findUnique({
      where: { userId: user.id },
    });

    if (!recruiterProfile) {
      throw new NotFoundException(
        'Profil Recruiter tidak ditemukan. Harap lengkapi profil.',
      );
    }

    if (!recruiterProfile.companyId) {
      throw new ForbiddenException(
        'Anda belum terhubung dengan perusahaan manapun.',
      );
    }

    return this.prisma.job.create({
      data: {
        ...dto,
        recruiterId: recruiterProfile.id,
        companyId: recruiterProfile.companyId!,
      },
    });
  }

  // 2. Find All (Public - Bisa difilter nanti)
  async findAll() {
    return this.prisma.job.findMany({
      where: { isActive: true },
      include: {
        company: { select: { name: true, logoUrl: true, location: true } }, // Include data company
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // 3. Find One (Detail)
  async findOne(id: string) {
    const job = await this.prisma.job.findUnique({
      where: { id },
      include: {
        company: true,
        recruiter: { select: { fullName: true } },
      },
    });

    if (!job) throw new NotFoundException('Job not found');
    return job;
  }
}
