import {
  Injectable, CanActivate, ExecutionContext, UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwt: JwtService, private reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    if (isPublic) return true;

    const req = ctx.switchToHttp().getRequest<{ headers: Record<string, string>; user?: unknown }>();
    const auth = req.headers['authorization'] ?? '';
    const [type, token] = auth.split(' ');
    if (type !== 'Bearer' || !token) throw new UnauthorizedException('Missing token');

    try {
      req.user = this.jwt.verify(token, {
        secret: process.env.JWT_SECRET ?? 'super-secret-jwt-key',
      });
    } catch {
      throw new UnauthorizedException('Token expired or invalid');
    }
    return true;
  }
}
