import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-yandex';

@Injectable()
export class YandexStrategy extends PassportStrategy(Strategy, 'yandex') {
  constructor(private configService: ConfigService) {
    super({
      clientID: configService.get('YANDEX_CLIENT_ID') as string,
      clientSecret: configService.get('YANDEX_CLIENT_SECRET') as string,
      callbackURL: configService.get('SERVER_URL') + '/auth/yandex/callback',
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken,
    profile: Profile,
    done: any,
  ) {
    const { username, emails, photos } = profile;
    const user = {
      email: emails?.[0].value,
      name: username,
      picture: photos?.[0].value,
    };
    done(null, user);
  }
}
