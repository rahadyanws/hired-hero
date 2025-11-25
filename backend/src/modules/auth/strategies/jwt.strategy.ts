// src/modules/auth/strategies/jwt.strategy.ts

import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

// Interface payload sesuai dengan yang kita buat di AuthService
type JwtPayload = {
  sub: string;
  email: string;
  role: string;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(configService: ConfigService) {
    const secret = configService.get<string>('JWT_SECRET');

    // Tambahkan Pengecekan Manual
    if (!secret) {
      throw new Error('JWT_SECRET is not defined in .env file');
    }

    super({
      // 1. Cara mengambil token: Dari Header Authorization (Bearer Token)
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),

      // 2. Pastikan token belum expired
      ignoreExpiration: false,

      // 3. Gunakan Secret Key yang sama dengan saat Login
      secretOrKey: secret,
    });
  }

  // Fungsi ini berjalan otomatis jika token valid
  async validate(payload: JwtPayload) {
    this.logger.debug(`Validating JWT payload for user: ${payload.email}`);

    if (!payload) {
      this.logger.warn('Token validation failed: No payload found');
      throw new UnauthorizedException();
    }

    // Return object ini akan otomatis masuk ke `req.user` di Controller
    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}
