// src/common/guards/jwt-auth.guard.ts

import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);

  // Kita bisa override handleRequest untuk custom error handling atau logging
  handleRequest(err, user, info, context: ExecutionContext) {
    if (err || !user) {
      this.logger.warn(
        `Unauthorized access attempt: ${info?.message || 'No token provided'}`,
      );
      throw (
        err || new UnauthorizedException('Anda harus login terlebih dahulu')
      );
    }
    return user;
  }
}
