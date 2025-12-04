import { Module } from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { ApplicationsController } from './applications.controller';
import { ResumeParser } from '../../common/helpers/resume-parser.helper';

@Module({
  controllers: [ApplicationsController],
  providers: [ApplicationsService, ResumeParser], // Masukkan ResumeParser di sini
})
export class ApplicationsModule {}
