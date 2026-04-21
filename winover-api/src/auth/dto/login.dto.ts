import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'nfe@test.com',
    description: 'E-mail cadastrado em POST /auth/register',
  })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'senha12345', description: 'Senha do usuário' })
  @IsString()
  password: string;
}
