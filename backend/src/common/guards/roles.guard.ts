import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { Role } from '../../../generated/prisma/client';

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Jika tidak ada batasan role di endpoint, izinkan lewat
    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    // Pastikan user ada (sudah lolos JwtAuthGuard) dan punya role yang sesuai
    const hasRole = requiredRoles.some((role) => user.role === role);

    if (!hasRole) {
      this.logger.warn(
        `Access denied: User ${user.email} with role ${user.role} tried to access restricted route.`,
      );
      throw new ForbiddenException(
        'Anda tidak memiliki izin untuk mengakses fitur ini',
      );
    }

    return true;
  }
}
