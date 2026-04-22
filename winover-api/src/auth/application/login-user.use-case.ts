import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../../users/users.service';
import { IssueAccessTokenUseCase } from './issue-access-token.use-case';

@Injectable()
export class LoginUserUseCase {
  constructor(
    private readonly usersService: UsersService,
    private readonly issueAccessToken: IssueAccessTokenUseCase,
  ) {}

  async execute(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      throw new UnauthorizedException('Credenciais inválidas');
    }
    return this.issueAccessToken.execute(user.id, user.email);
  }
}
