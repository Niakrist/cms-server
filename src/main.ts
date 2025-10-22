import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());
  app.enableCors({
    origin: [process.env.CLIENT_URL], // URL с которого можно обрабатывать запросы
    credentials: true, // Для привязки и работы с серверными куками
    exposedHeaders: 'set-cookie', // разрешить заголовок set-cookie
  });

  await app.listen(5000);
}
bootstrap();
