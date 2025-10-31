import { Injectable } from '@nestjs/common';
import { path } from 'app-root-path';
import { ensureDir, writeFile } from 'fs-extra';
import { IFileResponse } from './file.interface';

@Injectable()
export class FileService {
  // files: Express.Multer.File[] массив файлов, загруженных через Multer.
  // folder: string = 'products' папка для сохранения (по умолчанию 'products')
  async saveFiles(files: Express.Multer.File[], folder: string = 'products') {
    // путь к директории

    const uploadedFolder = `${path}/uploads/${folder}`;

    // создает директорию, если она не существует
    await ensureDir(uploadedFolder);

    // Обрабатывает все файлы параллельно
    const response: IFileResponse[] = await Promise.all(
      files.map(async (file) => {
        // Генерируется уникальное имя
        const originalName = `${Date.now()}-${file.originalname}`;

        // Файл сохраняется на диск с помощью writeFile()
        await writeFile(`${uploadedFolder}/${originalName}`, file.buffer);

        // Возвращается объект с информацией о файле
        return {
          name: originalName,
          url: `/uploads/${folder}/${originalName}`,
        };
      }),
    );

    // Возвращает массив объектов типа IFileResponse
    return response;
  }
}
