import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { ConfigModule } from '@nestjs/config';

// ConfigModule.forRoot() Для чтения .env

@Module({
  imports: [ConfigModule.forRoot(), PrismaService],
  controllers: [],
  providers: [],
})
export class AppModule {}
