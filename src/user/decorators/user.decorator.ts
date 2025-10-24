import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from 'generated/prisma';

// Нужен для получения данных пользователя
// createParamDecorator - Функция NestJS для создания кастомных параметрных декораторов
// data: keyof User - Параметр, который принимает название поля из модели User (например, 'id', 'email')
// ctx: ExecutionContext - Контекст выполнения, дающий доступ к запросу
// Получает HTTP-запрос: ctx.switchToHttp().getRequest()
// Извлекает пользователя из запроса: request.user
// Если передан параметр (например, 'id'), возвращает только это поле пользователя
// Если параметр не передан, возвращает весь объект пользователя
// @CurrentUser() - весь объект пользователя
// @CurrentUser('id') - Получить только id пользователя

export const CurrentUser = createParamDecorator(
  (data: keyof User, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    return data ? user[data] : user;
  },
);
