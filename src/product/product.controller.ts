import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { ProductDto } from './dto/product.dto';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  async getAll(@Query('searchTerm') searchTerm?: string) {
    return this.productService.getAll(searchTerm);
  }

  @Auth()
  @Get('by-storeId/:storeId')
  async getStoreById(@Param('storeId') storeId: string) {
    return this.productService.getByStoreId(storeId);
  }

  @Get('by-id/:productId')
  async getById(@Param('productId') productId: string) {
    return this.productService.getById(productId);
  }

  @Get('by-category/:categoryId')
  async getByCategory(@Param('categoryId') categoryId: string) {
    return this.productService.getByCategory(categoryId);
  }

  @Get('most-popular')
  async getMostPopular() {
    return this.productService.getMostPopular();
  }

  @Get('similar/:productId')
  async getSimilar(@Param('productId') productId: string) {
    return this.productService.getSimilar(productId);
  }

  @Auth()
  @UsePipes(new ValidationPipe())
  @HttpCode(200)
  @Post(':storeId')
  async create(@Param('storeId') storeId: string, @Body() dto: ProductDto) {
    return this.productService.create(storeId, dto);
  }

  @Auth()
  @UsePipes(new ValidationPipe())
  @HttpCode(200)
  @Put(':productId')
  async update(@Param('productId') productId: string, @Body() dto: ProductDto) {
    return this.productService.update(productId, dto);
  }

  @Auth()
  @HttpCode(200)
  @Delete(':productId')
  async delete(@Param('productId') productId: string) {
    return this.productService.delete(productId);
  }
}
