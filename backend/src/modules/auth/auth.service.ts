import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  // 1. Inisialisasi Logger
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    this.logger.log(`Register request received for email: ${dto.email}`);
    return this.usersService.create(dto);
  }

  async login(dto: LoginDto) {
    this.logger.debug(`Login attempt for email: ${dto.email}`); // Gunakan debug untuk info detail

    // 1. Cari User
    const user = await this.usersService.findByEmail(dto.email);

    // Logika validasi disatukan agar hacker tidak tahu apakah email salah atau password salah (Timing Attack mitigation)
    let isPasswordValid = false;
    if (user) {
      isPasswordValid = await bcrypt.compare(dto.password, user.password);
    }

    if (!user || !isPasswordValid) {
      this.logger.warn(
        `Failed login attempt for email: ${dto.email} - Invalid Credentials`,
      ); // Audit Trail: Security Warning
      throw new UnauthorizedException('Invalid credentials');
    }

    // 3. Generate Token
    const payload = { sub: user.id, email: user.email, role: user.role };
    this.logger.log(`User logged in successfully: ${user.id}`); // Audit Trail: Success

    return {
      access_token: await this.jwtService.signAsync(payload),
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }
}
