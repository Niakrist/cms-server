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
import { CategoryService } from './category.service';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { CategoryDto } from './dto/category.dto';

@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Auth()
  @Get('by-storeId/:storeId')
  async getByStoreId(@Param('storeId') storeId: string) {
    return this.categoryService.getByStoreId(storeId);
  }

  @Auth()
  @Get('by-id/:categoryId')
  async getById(@Param('categoryId') categoryId: string) {
    return this.categoryService.getById(categoryId);
  }

  @Auth()
  @UsePipes(new ValidationPipe())
  @HttpCode(200)
  @Post(':storeId')
  async create(@Body() dto: CategoryDto, @Param('storeId') storeId: string) {
    return this.categoryService.create(storeId, dto);
  }

  @Auth()
  @UsePipes(new ValidationPipe())
  @HttpCode(200)
  @Put(':categoryId')
  async update(
    @Body() dto: CategoryDto,
    @Param('categoryId') categoryId: string,
  ) {
    return this.categoryService.update(categoryId, dto);
  }

  @Auth()
  @HttpCode(200)
  @Delete(':categoryId')
  async delete(@Param('categoryId') categoryId: string) {
    return this.categoryService.delete(categoryId);
  }
}
