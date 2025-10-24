import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma.service';
import { UserService } from 'src/user/user.service';
import { AuthDto } from './dto/auth.dto';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  EXPIRE_DAY_REFRESH_TOKEN = 1;
  REFRESH_TOKEN_NAME = 'refreshToken';

  constructor(
    private jwt: JwtService,
    private userService: UserService,
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  async login(dto: AuthDto) {
    // Ищем пользователя, если НЕ найдем - вылетит ошибка NotFoundException
    const user = await this.validateUser(dto);

    // Генерируем токены для найденного user
    const tokens = this.issueTokens(user.id);

    // Возвращаем user + token
    return { user, ...tokens };
  }

  async register(dto: AuthDto) {
    console.log('dto: ', dto);
    // Ищем пользователя в БД по email
    const oldUser = await this.userService.getByEmail(dto.email);

    // Если найдем - вылетит ошибка NotFoundException
    if (oldUser) {
      throw new BadRequestException('Пользователь уже существует');
    }

    // Создаем новго пользователя
    const user = await this.userService.create(dto);

    // Генерируем токены для созданного user
    const tokens = this.issueTokens(user.id);

    // Возвращаем user + token
    return { user, ...tokens };
  }

  // refreshToken получаем из cookie
  async getNewTokens(refreshToken: string) {
    // Верифицируем полученный токен
    const result = await this.jwt.verifyAsync(refreshToken);

    if (!result) {
      throw new UnauthorizedException('Невалидный refreshToken');
    }
    // Находим пользователя в БД с id зашифрованном в refreshToken
    const user = await this.userService.getById(result.id);

    if (!user) {
      throw new BadRequestException('Пользователь не найден');
    }

    const tokens = this.issueTokens(user.id);

    return { user, ...tokens };
  }

  // Метод для генерации токенов для конкретного user
  issueTokens(userId: string) {
    const data = { id: userId };
    const accessToken = this.jwt.sign(data, {
      expiresIn: '1h',
    });

    const refreshToken = this.jwt.sign(data, {
      expiresIn: '7d',
    });

    return { accessToken, refreshToken };
  }

  private async validateUser(dto: AuthDto) {
    const user = await this.userService.getByEmail(dto.email);
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }
    return user;
  }

  async validateOAuthLogin(req: any) {
    let user = await this.userService.getByEmail(req.user.email);
    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email: req.user.email,
          name: req.user.name,
          picture: req.user.picture,
        },
        include: {
          stores: true,
          favorites: true,
          orders: true,
        },
      });
    }
    const tokens = this.issueTokens(user.id);
    return { user, ...tokens };
  }

  // Добавляет refresh token в HTTP cookie ответа для механизма аутентификации
  addRefreshTokenToResponse(res: Response, refreshToken: string) {
    // Задаем дату истекающего срока годности
    const expiresIn = new Date();
    expiresIn.setDate(expiresIn.getDate() + this.EXPIRE_DAY_REFRESH_TOKEN);
    res.cookie(this.REFRESH_TOKEN_NAME, refreshToken, {
      httpOnly: true, // Защита от XSS-атак, Cookie недоступны через JavaScript (document.cookie)
      domain: this.configService.get('SERVER_DOMAIN'), // Указание домена, для которого cookie действительны
      expires: expiresIn, // Время жизни cookie
      secure: true, //  Передача cookie только по HTTPS, на production лучше true
      sameSite: 'none', // Защита от CSRF-атак, контроль межсайтовых запросов, На production лучше lax
    });
    //'strict' - самый безопасный, запрещает все межсайтовые запросы
    //'lax' - разрешает GET-запросы с других сайтов (рекомендуется)
    //'none' - разрешает все межсайтовые запросы (требует secure: true)

    //XSS крадет вашу сессию (cookie, сессии, личные данные)
    //CSRF использует вашу сессию без кражи (Доступ к аккаунту, деньги)
  }

  // Удаление токена (при logout)
  removeRefreshTokenFromResponse(res: Response) {
    res.cookie(this.REFRESH_TOKEN_NAME, '', {
      httpOnly: true,
      domain: this.configService.get('SERVER_DOMAIN'),
      expires: new Date(0),
      secure: true,
      sameSite: 'none',
    });
  }
}
