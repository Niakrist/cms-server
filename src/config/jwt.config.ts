import { ConfigService } from '@nestjs/config';
import { JwtModuleOptions } from '@nestjs/jwt';

// функция для настройки  JWT модуля.
export const getJwtConfig = async (
  configService: ConfigService,
): Promise<JwtModuleOptions> => ({ secret: configService.get('JWT_SECRET') });
