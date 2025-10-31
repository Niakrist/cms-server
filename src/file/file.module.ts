import { Module } from '@nestjs/common';
import { FileService } from './file.service';
import { FileController } from './file.controller';
import { ServeStaticModule } from '@nestjs/serve-static';
import { path } from 'app-root-path';
@Module({
  imports: [
    // Подключение ServeStaticModule для хранения статических файлов
    // Без этого не будет нормально работать на frontend
    ServeStaticModule.forRoot({
      rootPath: `${path}/uploads`,
      serveRoot: '/uploads',
    }),
  ],
  controllers: [FileController],
  providers: [FileService],
})
export class FileModule {}
