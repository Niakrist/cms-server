import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { ProductDto } from './dto/product.dto';

@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) {}

  async getAll(searchTerm?: string) {
    if (searchTerm) {
      return this.getSearchTermFolter(searchTerm);
    }

    const products = await this.prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        category: true,
      },
    });
    return products;
  }

  async getByStoreId(storeId: string) {
    return this.prisma.product.findMany({
      where: { storeId },
      include: {
        category: true, // В магазине будем выводить категорию товара
        color: true, // В магазине будем выводить цвет товара
      },
    });
  }

  async getById(productId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: {
        category: true, // У карточки товара будет выводить категорию товара
        color: true, // У карточки товара будет выводить цвет товара
        reviews: true, // У карточки товара будет выводить отзывы на товар
      },
    });

    if (!product) {
      throw new NotFoundException('Товар не найден');
    }
    return product;
  }

  async getByCategory(categoryId: string) {
    const products = await this.prisma.product.findMany({
      where: {
        category: {
          id: categoryId,
        },
      },
      include: {
        category: true,
      },
    });

    if (!products) {
      throw new NotFoundException('Товары не найдены');
    }
    return products;
  }

  // Получение самых популпяных товаров (которых больше всего купили)
  async getMostPopular() {
    const mostPopularProducts = await this.prisma.orderItem.groupBy({
      by: ['productId'],
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
    });

    const productIds = mostPopularProducts.map(
      (item) => item.productId,
    ) as string[];

    const products = await this.prisma.product.findMany({
      where: {
        id: {
          in: productIds,
        },
      },
      include: {
        category: true, // У карточки товара будет выводить категорию товара
      },
    });
    return products;
  }

  // Получение похожих товаров (по категории)
  async getSimilar(productId: string) {
    const currentProduct = await this.getById(productId);

    if (!currentProduct.category?.title) {
      // throw new BadRequestException('Для определения похожих продуктов необходима категория товара.');
      return []; // Возвращаем пустой массив, если категория отсутствует
    }

    const products = await this.prisma.product.findMany({
      where: {
        // условие поиска “похожести”. Ищем продукты, у которых category.title совпадает с title категории текущего продукта (currentProduct).
        category: { title: currentProduct.category?.title },
        NOT: { id: currentProduct.id }, // Исключаем текущйи продукт
      },
      orderBy: { createdAt: 'asc' }, // ортирует найденные похожие продукты по дате создания, начиная с самых старых.
      include: { category: true }, //  для каждого найденного похожего продукта включает его связанную информацию о категории.
    });
    return products;
  }

  async create(storeId: string, dto: ProductDto) {
    return this.prisma.product.create({
      data: {
        title: dto.title,
        description: dto.description,
        images: dto.images,
        price: dto.price,
        categoryId: dto.categoryId,
        colorId: dto.colorId,
        storeId,
      },
    });
  }

  async update(productId: string, dto: ProductDto) {
    await this.getById(productId);

    return this.prisma.product.update({
      where: { id: productId },
      data: dto,
    });
  }

  async delete(productId: string) {
    return this.prisma.product.delete({ where: { id: productId } });
  }

  private async getSearchTermFolter(searchTerm: string) {
    // OR оператор фильтрации, используемый в ORM Prisma
    return this.prisma.product.findMany({
      where: {
        OR: [
          {
            title: {
              contains: searchTerm,
              mode: 'insensitive', // нечувствительный к регистру
            },
            description: {
              contains: searchTerm,
              mode: 'insensitive',
            },
          },
        ],
      },
    });
  }
}
