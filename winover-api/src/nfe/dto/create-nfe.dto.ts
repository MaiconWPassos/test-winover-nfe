import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsNumber,
  IsString,
  Length,
  Matches,
  Min,
  ValidateNested,
} from 'class-validator';
import { IsCnpj } from '../../common/validators/cnpj.validator';

export class NfeItemInputDto {
  @ApiProperty({
    example: 'P001',
    description: 'Código do produto no ERP fictício (seed: P001, P002)',
  })
  @IsString()
  codigoProduto: string;

  @ApiProperty({ example: 1, description: 'Quantidade (> 0)' })
  @IsNumber({ maxDecimalPlaces: 4 })
  @Type(() => Number)
  @Min(0.0001)
  quantidade: number;

  @ApiProperty({ example: 100.5, description: 'Valor unitário (> 0)' })
  @IsNumber({ maxDecimalPlaces: 4 })
  @Type(() => Number)
  @Min(0.01)
  valorUnitario: number;

  @ApiProperty({
    example: '5102',
    description: 'CFOP com 4 dígitos',
  })
  @Matches(/^\d{4}$/, { message: 'CFOP deve ter 4 dígitos numéricos' })
  cfop: string;

  @ApiProperty({
    example: '00',
    description: 'CST com 2 ou 3 dígitos numéricos',
  })
  @Matches(/^\d{2,3}$/, { message: 'CST deve ter 2 ou 3 dígitos numéricos' })
  cst: string;
}

export class CreateNfeDto {
  @ApiProperty({
    example: '11222333000181',
    description:
      'CNPJ do destinatário (deve existir no ERP seed; pode ser com ou sem máscara)',
  })
  @IsCnpj()
  cnpjDestinatario: string;

  @ApiProperty({
    example: '123456789011',
    description: 'IE igual ao cadastro ERP do destinatário',
  })
  @IsString()
  @Length(2, 20)
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  ieDestinatario: string;

  @ApiProperty({
    example: 'SP',
    description: 'UF do destinatário (2 letras, ex.: SP)',
  })
  @IsString()
  @Length(2, 2)
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toUpperCase() : value,
  )
  @Matches(/^[A-Z]{2}$/, { message: 'UF deve ser sigla válida (ex.: SP)' })
  ufDestinatario: string;

  @ApiProperty({
    type: [NfeItemInputDto],
    example: [
      {
        codigoProduto: 'P001',
        quantidade: 1,
        valorUnitario: 100.5,
        cfop: '5102',
        cst: '00',
      },
    ],
    description: 'Itens da nota (mínimo 1). Use produtos do seed.',
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => NfeItemInputDto)
  itens: NfeItemInputDto[];
}
