import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
// without injectable config cant be injected (in my opinion)
@Injectable()
export class RtStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      passReqToCallback: true,
      secretOrKey: config.get('RT_SECRET'),
    });
  }

  validate(req: Request, payload: any) {
    const refreshToken = req.get('authentication').replace('Bearer', '').trim();
    return {
      ...payload,
      refreshToken,
    };
  }
}