import {
  Injectable, ConflictException, UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async register(email: string, password: string, name: string) {
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) throw new ConflictException('Email already registered');

    const hashed = await bcrypt.hash(password, 10);
    const user = await this.prisma.user.create({
      data: { email, password: hashed, name },
      select: { id: true, email: true, name: true, role: true },
    });

    return this.issueTokens(user.id, user.email, user.role);
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    return this.issueTokens(user.id, user.email, user.role);
  }

  async refresh(refreshToken: string) {
    const stored = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!stored || stored.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token invalid or expired');
    }

    // Rotate token
    await this.prisma.refreshToken.delete({ where: { token: refreshToken } });
    return this.issueTokens(stored.userId, stored.user.email, stored.user.role);
  }

  async logout(refreshToken: string) {
    await this.prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
    return { message: 'Logged out' };
  }

  async me(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });
  }

  async seedAdmin() {
    const existing = await this.prisma.user.findUnique({ where: { email: 'admin@tuktuk.com' } });
    if (existing) return { message: 'Admin already exists' };

    const hashed = await bcrypt.hash('admin123', 10);
    await this.prisma.user.create({
      data: { email: 'admin@tuktuk.com', password: hashed, name: 'Admin', role: 'ADMIN' },
    });
    return { message: 'Admin user created: admin@tuktuk.com / admin123' };
  }

  private async issueTokens(userId: string, email: string, role: string) {
    const payload = { sub: userId, email, role };
    const access_token = this.jwt.sign(payload, {
      secret: process.env.JWT_SECRET ?? 'super-secret-jwt-key',
      expiresIn: '15m',
    });
    const refresh_token = randomUUID();

    await this.prisma.refreshToken.create({
      data: {
        token: refresh_token,
        userId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return { access_token, refresh_token };
  }
}
