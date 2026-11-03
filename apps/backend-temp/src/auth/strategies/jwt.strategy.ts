import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { EnterpriseService } from '../../enterprise/enterprise.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly enterprise: EnterpriseService, config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => {
          let token: string | null = null;
          if (req && req.cookies) {
            token = req.cookies['token'];
          }
          if (!token) {
            token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
          }
          return token;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    const role = payload.role || 'EMPLOYEE';
    const permissions = this.enterprise.getRolePermissions(role);
    return {
      id: payload.id,
      email: payload.email,
      role: role,
      permissions: permissions,
    };
  }
}
