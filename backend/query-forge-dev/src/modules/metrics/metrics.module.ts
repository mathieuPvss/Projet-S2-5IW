import { Module } from '@nestjs/common';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { MetricsService } from './metrics.service';
import { MetricsController } from './metrics.controller';
import { MetricsProviders } from './metrics.providers';

@Module({
  imports: [
    PrometheusModule.register({
      defaultMetrics: {
        enabled: true,
        config: {
          prefix: 'query_forge_',
        },
      },
      path: '/metrics',
      defaultLabels: {
        app: 'query-forge-dev',
        version: '1.0.0',
      },
    }),
  ],
  controllers: [MetricsController],
  providers: [MetricsService, ...MetricsProviders],
  exports: [MetricsService],
})
export class MetricsModule {}
