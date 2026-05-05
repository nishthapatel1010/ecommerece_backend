import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractToken(request);

    if (!token) throw new UnauthorizedException('Access token is required.');

    try {
      const secret = this.configService.get<string>('JWT_SECRET');
      const payload = this.jwtService.verify(token, { secret });
      (request as any).user = payload;
    } catch {
      throw new UnauthorizedException('Invalid or expired access token.');
    }

    return true;
  }

  private extractToken(request: Request): string | null {
    const auth = request.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) return null;
    return auth.split(' ')[1];
  }
}
