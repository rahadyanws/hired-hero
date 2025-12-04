import {
  Controller,
  Post,
  Param,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApplicationsService } from './applications.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../../generated/prisma/client';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { multerConfig } from '../../config/multer.config';

@Controller('jobs') // Kita nested route di bawah /jobs biar rapi: /jobs/:id/apply
export class ApplicationsController {
  private readonly logger = new Logger(ApplicationsController.name);

  constructor(private readonly applicationsService: ApplicationsService) {}

  @Post(':id/apply')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CANDIDATE) // Hanya kandidat yang boleh apply
  @UseInterceptors(FileInterceptor('resume', multerConfig)) // 'resume' adalah nama field di form-data
  async apply(
    @Param('id') jobId: string,
    @CurrentUser() user: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Resume PDF file is required');
    }

    this.logger.log(`Received application request for job ${jobId}`);
    return this.applicationsService.applyJob(user, jobId, file);
  }
}
