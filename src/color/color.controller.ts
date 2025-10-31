import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ColorService } from './color.service';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { ColorDto } from './dto/color.dto';

@Controller('colors')
export class ColorController {
  constructor(private readonly colorService: ColorService) {}

  @Auth()
  @Get('by-storeId/:storeId')
  async getByStoreId(@Param('storeId') id: string) {
    return this.colorService.getByStoreId(id);
  }

  @Auth()
  @Get('by-id/:id')
  async getById(@Param('id') id: string) {
    return this.colorService.getById(id);
  }

  @Auth()
  @UsePipes(new ValidationPipe())
  @HttpCode(200)
  @Post(':storeId')
  async create(@Body() dto: ColorDto, @Param('storeId') storeId: string) {
    return this.colorService.create(storeId, dto);
  }

  @Auth()
  @UsePipes(new ValidationPipe())
  @HttpCode(200)
  @Put(':colorId')
  async update(@Param('colorId') colorId: string, @Body() dto: ColorDto) {
    return this.colorService.update(colorId, dto);
  }

  @Auth()
  @HttpCode(200)
  @Delete(':colorId')
  async delete(@Param('colorId') colorId: string) {
    return this.colorService.delete(colorId);
  }
}
