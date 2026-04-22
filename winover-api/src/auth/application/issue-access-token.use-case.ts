import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { JwtPayload } from '../strategies/jwt.strategy';

export type AccessTokenBundle = {
  access_token: string;
  token_type: 'Bearer';
  expires_in: '7d';
};

@Injectable()
export class IssueAccessTokenUseCase {
  constructor(private readonly jwtService: JwtService) {}

  execute(userId: string, email: string): AccessTokenBundle {
    const payload: JwtPayload = { sub: userId, email };
    return {
      access_token: this.jwtService.sign(payload),
      token_type: 'Bearer',
      expires_in: '7d',
    };
  }
}
