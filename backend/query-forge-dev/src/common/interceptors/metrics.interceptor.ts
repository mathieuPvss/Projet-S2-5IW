import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { MetricsService } from '../../modules/metrics/metrics.service';

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  constructor(private readonly metricsService: MetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const method = request.method;
    const route = request.route?.path || request.url;
    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = (Date.now() - startTime) / 1000;
          const status = response.statusCode.toString();

          this.metricsService.incrementHttpRequests(method, route, status);
          this.metricsService.recordHttpDuration(method, route, duration);
        },
        error: (error) => {
          const duration = (Date.now() - startTime) / 1000;
          const status = error.status?.toString() || '500';

          this.metricsService.incrementHttpRequests(method, route, status);
          this.metricsService.recordHttpDuration(method, route, duration);
        },
      }),
    );
  }
}
