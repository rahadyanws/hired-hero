import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
// import { PrismaClient } from '@prisma/client';
import { PrismaClient } from '../../../generated/prisma/client';

@Injectable()
export class DatabaseService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(DatabaseService.name);

  async onModuleInit() {
    try {
      await this.$connect();
      // 2. Log Sukses
      this.logger.log(' ✅ Database connection established successfully');
    } catch (error) {
      // 3. Log Error Fatal
      this.logger.error(' ❎ Failed to connect to database', error.stack);
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('🔌 Database connection closed');
  }
}
