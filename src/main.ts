import cors from '@fastify/cors';
import fastifyCsrf from '@fastify/csrf-protection';
import helmet from '@fastify/helmet';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: true }),
  );

  app.register(cors, {
    origin: '*',
  });

  await app.register(helmet, { contentSecurityPolicy: false });
  await app.register(fastifyCsrf);
  await app.listen(80, '0.0.0.0');
}
bootstrap();
