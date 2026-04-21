import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiOperation,
  ApiResponse,
  ApiSecurity,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

type AuthedRequest = Request & { user: { id: string; email: string } };

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Cadastro de usuário' })
  @ApiBody({ type: RegisterDto, required: true })
  @ApiConflictResponse({ description: 'E-mail já cadastrado' })
  @ApiResponse({
    status: 201,
    description: 'Token JWT',
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        token_type: 'Bearer',
        expires_in: '7d',
      },
    },
  })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto.email, dto.password);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login (retorna JWT)' })
  @ApiBody({ type: LoginDto, required: true })
  @ApiResponse({
    status: 200,
    description: 'Token JWT',
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        token_type: 'Bearer',
        expires_in: '7d',
      },
    },
  })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password);
  }

  @ApiBearerAuth('JWT-auth')
  @ApiSecurity('JWT-auth')
  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  @ApiOperation({ summary: 'Usuário autenticado' })
  @ApiUnauthorizedResponse({ description: 'JWT ausente, expirado ou inválido' })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        email: 'nfe@test.com',
      },
    },
  })
  me(@Req() req: AuthedRequest) {
    return { id: req.user.id, email: req.user.email };
  }
}
