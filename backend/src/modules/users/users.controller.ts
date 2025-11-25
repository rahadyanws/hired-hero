// src/modules/users/users.controller.ts

import { Controller, Get, UseGuards, Logger } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('users')
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(private readonly usersService: UsersService) {}

  // Endpoint Terproteksi
  @UseGuards(JwtAuthGuard) // <--- Guard dipasang di sini
  @Get('me')
  async getProfile(@CurrentUser() user: any) {
    this.logger.log(`User ${user.email} is requesting their profile data`);

    // Ambil data detail user dari database (termasuk Candidate/Recruiter Profile)
    // Note: Kita harus update findByEmail di service agar include profile, tapi untuk tes ini user object saja cukup.
    return user;
  }
}
