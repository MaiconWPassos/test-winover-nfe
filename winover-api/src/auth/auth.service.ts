import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import type { JwtPayload } from './strategies/jwt.strategy';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(email: string, password: string) {
    const existing = await this.usersService.findByEmail(email);
    if (existing) {
      throw new ConflictException('E-mail já cadastrado');
    }
    const user = await this.usersService.create(email, password);
    return this.buildTokenResponse(user.id, user.email);
  }

  async login(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      throw new UnauthorizedException('Credenciais inválidas');
    }
    return this.buildTokenResponse(user.id, user.email);
  }

  private buildTokenResponse(userId: string, email: string) {
    const payload: JwtPayload = { sub: userId, email };
    return {
      access_token: this.jwtService.sign(payload),
      token_type: 'Bearer' as const,
      expires_in: '7d',
    };
  }
}
