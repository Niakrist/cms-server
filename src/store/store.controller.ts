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
import { StoreService } from './store.service';
import { CurrentUser } from 'src/user/decorators/user.decorator';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.to';

@Controller('stores')
export class StoreController {
  constructor(private readonly storeService: StoreService) {}

  @Auth()
  @Get('by-id/:id')
  async getById(@Param('id') storeId: string, @CurrentUser('id') userId) {
    return this.storeService.getById(storeId, userId);
  }

  @Auth()
  @UsePipes(new ValidationPipe()) // Для корректной работы dto
  @HttpCode(200)
  @Post()
  async create(@Body() dto: CreateStoreDto, @CurrentUser('id') userId: string) {
    return this.storeService.create(dto, userId);
  }

  @Auth()
  @UsePipes(new ValidationPipe())
  @HttpCode(200)
  @Put(':id')
  async update(
    @Param('id') storeId: string,
    @Body() dto: UpdateStoreDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.storeService.update(storeId, userId, dto);
  }

  @Auth()
  @HttpCode(200)
  @Delete(':id')
  async delete(
    @Param('id') storeId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.storeService.delete(storeId, userId);
  }
}
