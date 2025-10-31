import {
  Controller,
  HttpCode,
  Post,
  Query,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileService } from './file.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Auth } from 'src/auth/decorators/auth.decorator';

@Controller('files')
export class FileController {
  constructor(private readonly fileService: FileService) {}
  @Auth()
  @HttpCode(200)
  // Interceptor - перехватывает запрос перед обработкой
  // FilesInterceptor - специальный интерцептор для обработки multipart/form-data
  // 'files' - имя поля формы, в котором ожидаются файлы
  @UseInterceptors(FilesInterceptor('files'))
  @Post()
  async saveFiles(
    // Извлекает загруженные файлы из запроса
    // files - массив файлов, обработанных Multer
    // Body: files: [file1, file2, file3]
    @UploadedFiles() files: Express.Multer.File[],
    // Извлекает опциональный query параметр folder из URL
    // POST /files?folder=products
    // Content-Type: multipart/form-data
    // Authorization: Bearer <token>
    @Query('folder') folder?: string,
  ) {
    return this.fileService.saveFiles(files, folder);
  }
}
