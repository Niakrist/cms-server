import { IsString } from 'class-validator';

export class CreateStoreDto {
  @IsString({ message: 'Обязательное поле' })
  title: string;
}
