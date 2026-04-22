import { Injectable } from '@nestjs/common';
import { LoginUserUseCase } from './application/login-user.use-case';
import { RegisterUserUseCase } from './application/register-user.use-case';

@Injectable()
export class AuthService {
  constructor(
    private readonly registerUser: RegisterUserUseCase,
    private readonly loginUser: LoginUserUseCase,
  ) {}

  register(email: string, password: string) {
    return this.registerUser.execute(email, password);
  }

  login(email: string, password: string) {
    return this.loginUser.execute(email, password);
  }
}
