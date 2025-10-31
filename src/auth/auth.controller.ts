import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';
import type { Request, response, Response } from 'express';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UsePipes(new ValidationPipe()) // Для корректной работы dto
  @HttpCode(200)
  @Post('login')
  // Метод для Login
  async login(@Body() dto: AuthDto, @Res({ passthrough: true }) res: Response) {
    //passthrough: true: Позволяет одновременно использовать и объект Response, и возвращаемое значение из метода
    //res:  нужен для работы с HTTP-ответом на низком уровне
    //res.cookie()      Установка cookie
    //res.setHeader()   Установка заголовков
    //res.status()      Установка статус кода
    //res.redirect()    Перенаправление

    //response (переменная в коде) Объект с данными для возврата клиенту

    // Забираем из ответа refreshToken
    const { refreshToken, ...response } = await this.authService.login(dto);

    // Устанавливаем refreshToken в cookie
    this.authService.addRefreshTokenToResponse(res, refreshToken);

    // Возвращаем response с accessToken без refreshToken
    return response;
  }

  @UsePipes(new ValidationPipe())
  @HttpCode(200)
  @Post('register')
  // Метод для регистрации
  async register(
    @Body() dto: AuthDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { refreshToken, ...response } = await this.authService.register(dto);

    this.authService.addRefreshTokenToResponse(res, refreshToken);

    return response;
  }

  @UsePipes(new ValidationPipe())
  @HttpCode(200)
  //Метод для получения user с обновленым токеном по нашему refreshToken
  @Post('login/access-token')
  async getNewTokens(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    // Забираем refreshToken из cookie
    const refreshTokenFromCookies =
      req.cookies[this.authService.REFRESH_TOKEN_NAME];

    if (!refreshTokenFromCookies) {
      this.authService.removeRefreshTokenFromResponse(res);
      throw new UnauthorizedException('Refresh токен не прошёл');
    }

    // Создаем новые refresh и access token
    const { refreshToken, ...response } = await this.authService.getNewTokens(
      refreshTokenFromCookies,
    );

    // Устанаваливаем новый refreshToken в cookie
    this.authService.addRefreshTokenToResponse(res, refreshToken);

    // Возвращаем user с accessToken
    return response;
  }

  @HttpCode(200)
  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    this.authService.removeRefreshTokenFromResponse(res);
    return true;
  }

  // Инициация авторизации через google
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() _req) {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  // AuthGuard('google') обменивает код от Google на accessToken и получает профиль пользователя, результат сохраняется в req.user
  async googleAuthCallback(
    @Req() req: any,
    @Res({ passthrough: true }) res: Response,
  ) {
    // валидация и создание токенов, если user нет, создает user
    const { refreshToken, ...response } =
      await this.authService.validateOAuthLogin(req);

    //Сохраняет refresh token в HTTP-only cookie для автоматического обновления сессии
    this.authService.addRefreshTokenToResponse(res, refreshToken);

    // Перенаправляет пользователя обратно на фронтенд и передает access token через URL параметр
    return res.redirect(
      `${process.env['CLIENT_URL']}/dashboard?accessToken=${response.accessToken}`,
    );
    // Access token в URL - для первоначальной авторизации на клиенте (живет недолго, при истечении access token клиент использует refresh token из cookie для получения нового)
    // Refresh token в cookie - для автоматического продления сессии (httpOnly защищен от XSS)
    // Redirect на dashboard - плавный пользовательский опыт
  }

  // Инициация авторизации через yandex
  @Get('yandex')
  @UseGuards(AuthGuard('yandex')) // Делает redirect 302 на Яндекс https://oauth.yandex.ru/authorize?
  async yandexAuth(@Req() _req) {}

  @Get('yandex/callback')
  @UseGuards(AuthGuard('yandex'))
  async yandexAuthCallback(
    @Req() req: any,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { refreshToken, ...response } =
      await this.authService.validateOAuthLogin(req);

    this.authService.addRefreshTokenToResponse(res, refreshToken);

    return res.redirect(
      `${process.env['CLIENT_URL']}/dashboard?accessToken=${response.accessToken}`,
    );
  }
}
