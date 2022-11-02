import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import { EnvKey } from '@enums/env-key';
import { fastifyHelmet } from '@fastify/helmet';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: true }),
  );
  await app.register(fastifyHelmet);
  app.enableCors();
  app.enableShutdownHooks();
  const configService = app.get(ConfigService);
  await app.listen(configService.get(EnvKey.port, 3000), '0.0.0.0');
}
bootstrap();
