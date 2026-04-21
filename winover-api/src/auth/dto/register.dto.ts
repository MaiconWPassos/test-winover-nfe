import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    example: 'nfe@test.com',
    description: 'E-mail do usuário (único no sistema)',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'senha12345',
    description: 'Mínimo 8 caracteres',
    minLength: 8,
  })
  @IsString()
  @MinLength(8, { message: 'Senha deve ter no mínimo 8 caracteres' })
  password: string;
}
