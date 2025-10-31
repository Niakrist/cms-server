import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ReviewService } from './review.service';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { CurrentUser } from 'src/user/decorators/user.decorator';
import { ReviewDto } from './dto/review.dto';

@Controller('review')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Auth()
  @Get('by-storeId/:storeId')
  async getByStoreId(@Param('storeId') storeId: string) {
    return this.reviewService.getByStoreId(storeId);
  }

  @Get('by-id/:reviewId')
  async getById(
    @Param('reviewId') reviewId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.reviewService.getById(reviewId, userId);
  }

  @Auth()
  @UsePipes(new ValidationPipe())
  @HttpCode(200)
  @Post(':productId/:storeId')
  async create(
    @Body() dto: ReviewDto,
    @CurrentUser('id') userId: string,
    @Param('productId') productId: string,
    @Param('storeId') storeId: string,
  ) {
    return this.reviewService.create(dto, userId, productId, storeId);
  }

  @Auth()
  @HttpCode(200)
  @Delete(':reviewId')
  async delete(
    @Param('reviewId') reviewId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.reviewService.delete(reviewId, userId);
  }
}
