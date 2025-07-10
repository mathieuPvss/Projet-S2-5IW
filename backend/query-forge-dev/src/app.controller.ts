import { Controller, Get } from '@nestjs/common';
import { MetricsService } from './modules/metrics/metrics.service';

@Controller()
export class AppController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get('health')
  healthCheck() {
    this.metricsService.incrementDbOperations('read', 'health', 'success');
    return { status: 'ok' };
  }
}
