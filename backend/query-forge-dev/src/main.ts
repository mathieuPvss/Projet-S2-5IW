import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const isProduction = process.env.NODE_ENV === 'production';
  const migrationsPath = isProduction
    ? ['dist/migrations/*.js']
    : ['src/migrations/*.ts'];

  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('Is Production:', isProduction);
  console.log('Migrations Path:', migrationsPath);
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api', {
    exclude: ['health', 'metrics'],
  });

  app.enableCors({
    origin: '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  const config = new DocumentBuilder()
    .setTitle('Query Forge Dev API')
    .setVersion('1.0')
    .addTag('Query Forge Dev')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        in: 'header',
        name: 'Authorization',
      },
      'access-token',
    )
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  await app.listen(process.env.NEST_PORT);
}
bootstrap();
