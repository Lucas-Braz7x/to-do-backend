import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private readonly prisma = new PrismaClient({
    log: ['error', 'warn'],
  });

  async onModuleInit(): Promise<void> {
    await this.prisma.$connect();
    type QueryEvent = {
      timestamp: Date;
      query: string;
      params: string;
      duration: number;
      target: string;
    };

    (
      this.prisma as unknown as {
        $on: (event: string, callback: (e: QueryEvent) => void) => void;
      }
    ).$on('query', (e: QueryEvent) => {
      console.log('Current Time: ' + new Date().toISOString());
      console.log('Query: ' + e.query);
      console.log('Params: ' + e.params);
      console.log('Duration: ' + e.duration + 'ms');
    });
  }

  async onModuleDestroy(): Promise<void> {
    await this.prisma.$disconnect();
  }

  get client(): PrismaClient {
    return this.prisma;
  }

  async isHealthy(): Promise<boolean> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }
}
