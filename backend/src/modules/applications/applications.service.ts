import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from '../../core/database/database.service';
import { ResumeParser } from '../../common/helpers/resume-parser.helper';

@Injectable()
export class ApplicationsService {
  private readonly logger = new Logger(ApplicationsService.name);

  constructor(
    private prisma: DatabaseService,
    private resumeParser: ResumeParser, // Inject Helper tadi
  ) {}

  async applyJob(user: any, jobId: string, file: Express.Multer.File) {
    this.logger.log(`User ${user.email} applying for Job ID: ${jobId}`);

    // 1. Validasi: Cari Candidate Profile
    const candidate = await this.prisma.candidateProfile.findUnique({
      where: { userId: user.id },
    });

    if (!candidate) {
      throw new NotFoundException(
        'Please complete your candidate profile first.',
      );
    }

    // 2. Validasi: Cek apakah Job ada
    const job = await this.prisma.job.findUnique({ where: { id: jobId } });
    if (!job) throw new NotFoundException('Job not found');

    // 3. Validasi: Cek Double Apply
    const existingApp = await this.prisma.application.findUnique({
      where: {
        jobId_candidateId: {
          jobId: jobId,
          candidateId: candidate.id,
        },
      },
    });

    if (existingApp) {
      throw new ConflictException('You have already applied for this job.');
    }

    // 4. Ekstrak Teks dari PDF (PENTING UNTUK AI)
    // Kita baca file yang baru saja diupload ke disk
    const fs = require('fs');
    const fileBuffer = fs.readFileSync(file.path);
    const resumeText = await this.resumeParser.parsePdfToText(fileBuffer);

    // 5. Simpan ke Database
    const application = await this.prisma.application.create({
      data: {
        jobId: jobId,
        candidateId: candidate.id,
        status: 'AI_PROCESSING', // Default status awal
        resumeUrlSnapshot: file.path, // Simpan path lokal dulu

        // Simpan text hasil ekstraksi sementara di field aiRawResponse
        // (atau buat field baru 'resumeText' di schema jika mau lebih rapi)
        // Untuk skrg kita simpan di raw JSON biar aman.
        aiRawResponse: {
          extractedResumeText: resumeText,
        },
      },
    });

    // TODO: Trigger BullMQ Job disini untuk scoring AI (Next Step)

    this.logger.log(`Application submitted successfully: ID ${application.id}`);
    return application;
  }
}
