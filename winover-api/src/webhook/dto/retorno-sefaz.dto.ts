import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateIf,
} from 'class-validator';

export const RETORNO_SEFAZ_SITUACOES = ['autorizada', 'rejeitada'] as const;
export type RetornoSefazSituacao = (typeof RETORNO_SEFAZ_SITUACOES)[number];

export class RetornoSefazDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  nfeId: string;

  @ApiProperty({ enum: RETORNO_SEFAZ_SITUACOES })
  @IsIn(RETORNO_SEFAZ_SITUACOES)
  situacao: RetornoSefazSituacao;

  @ApiPropertyOptional({
    description:
      'Número do protocolo (autorizada). Se omitido, um protocolo mock é gerado.',
  })
  @IsOptional()
  @IsString()
  protocolo?: string;

  @ApiPropertyOptional({ description: 'Obrigatório se situacao = rejeitada' })
  @ValidateIf((o: RetornoSefazDto) => o.situacao === 'rejeitada')
  @IsNotEmpty()
  @IsString()
  codigoRejeicao?: string;

  @ApiPropertyOptional({ description: 'Obrigatório se situacao = rejeitada' })
  @ValidateIf((o: RetornoSefazDto) => o.situacao === 'rejeitada')
  @IsNotEmpty()
  @IsString()
  motivoRejeicao?: string;
}
