import { ConflictException, Injectable } from '@nestjs/common';
import { UsersService } from '../../users/users.service';
import { IssueAccessTokenUseCase } from './issue-access-token.use-case';

@Injectable()
export class RegisterUserUseCase {
  constructor(
    private readonly usersService: UsersService,
    private readonly issueAccessToken: IssueAccessTokenUseCase,
  ) {}

  async execute(email: string, password: string) {
    const existing = await this.usersService.findByEmail(email);
    if (existing) {
      throw new ConflictException('E-mail já cadastrado');
    }
    const user = await this.usersService.create(email, password);
    return this.issueAccessToken.execute(user.id, user.email);
  }
}
