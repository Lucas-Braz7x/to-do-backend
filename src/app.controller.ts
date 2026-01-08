import { Controller, Get } from '@nestjs/common';
import { AppService, HealthCheckResponse } from './app.service';
import { Public } from './modules/auth/decorators/public.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Public()
  @Get('health')
  async healthCheck(): Promise<HealthCheckResponse> {
    return this.appService.checkHealth();
  }
}
