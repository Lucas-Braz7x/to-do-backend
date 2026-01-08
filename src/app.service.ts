import { Injectable } from '@nestjs/common';
import { PrismaService } from './modules/prisma/services/prisma.service';

export interface HealthCheckResponse {
  status: 'ok' | 'error';
  timestamp: string;
  database: 'connected' | 'disconnected';
}

@Injectable()
export class AppService {
  constructor(private readonly prismaService: PrismaService) {}

  getHello(): string {
    return 'App is running!';
  }

  async checkHealth(): Promise<HealthCheckResponse> {
    const isDatabaseHealthy = await this.prismaService.isHealthy();

    return {
      status: isDatabaseHealthy ? 'ok' : 'error',
      timestamp: new Date().toISOString(),
      database: isDatabaseHealthy ? 'connected' : 'disconnected',
    };
  }
}
