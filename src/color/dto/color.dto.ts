import { IsString } from 'class-validator';

export class ColorDto {
  @IsString({ message: 'Название цвета - обязательное поле' })
  name: string;

  @IsString({ message: 'Значение - обязательное поле' })
  value: string;
}
