import { Controller, Get } from '@nestjs/common';
import { MetricsService } from './modules/metrics/metrics.service';
import { Public } from './common/decorator/public.decorator';

@Controller()
export class AppController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get('health')
  @Public()
  healthCheck() {
    this.metricsService.incrementDbOperations('read', 'health', 'success');
    return { status: 'ok' };
  }
}
