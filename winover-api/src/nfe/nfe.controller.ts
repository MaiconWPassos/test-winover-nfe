import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiProduces,
  ApiResponse,
  ApiSecurity,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { CreateNfeDto } from './dto/create-nfe.dto';
import { ListNfeQueryDto } from './dto/list-nfe-query.dto';
import { NfeService } from './nfe.service';

@ApiTags('nfe')
@ApiBearerAuth('JWT-auth')
@ApiSecurity('JWT-auth')
@UseGuards(AuthGuard('jwt'))
@Controller('nfe')
export class NfeController {
  constructor(private readonly nfeService: NfeService) {}

  @Get('stats')
  @ApiOperation({
    summary:
      'Resumo para gráficos (por status e por dia civil, últimos 30 dias no fuso STATS_TIMEZONE)',
  })
  @ApiUnauthorizedResponse({ description: 'JWT ausente, expirado ou inválido' })
  @ApiResponse({ status: 200, description: 'Totais e séries agregadas' })
  getStats() {
    return this.nfeService.getDashboardStats();
  }

  @Get()
  @ApiOperation({ summary: 'Lista NF-e emitidas (mais recentes primeiro)' })
  @ApiUnauthorizedResponse({ description: 'JWT ausente, expirado ou inválido' })
  @ApiResponse({ status: 200, description: 'Lista resumida' })
  list(@Query() query: ListNfeQueryDto) {
    return this.nfeService.listSummaries(query.limit ?? 50);
  }

  @Post()
  @ApiOperation({
    summary: 'Inicia emissão de NF-e (fila assíncrona + mock SEFAZ)',
  })
  @ApiBody({ type: CreateNfeDto, required: true })
  @ApiUnauthorizedResponse({ description: 'JWT ausente, expirado ou inválido' })
  @ApiResponse({
    status: 201,
    description: 'NF-e aceita para processamento',
    schema: {
      example: {
        id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        numero: 1,
        status: 'processamento',
      },
    },
  })
  create(@Body() dto: CreateNfeDto) {
    return this.nfeService.create(dto);
  }

  @Get(':id/xml')
  @ApiOperation({ summary: 'Obtém XML da NF-e autorizada' })
  @ApiUnauthorizedResponse({ description: 'JWT ausente, expirado ou inválido' })
  @ApiParam({
    name: 'id',
    required: true,
    format: 'uuid',
    example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    description: 'ID da NF-e com status autorizada',
  })
  @ApiProduces('application/xml')
  @ApiResponse({ status: 200, description: 'XML autorizado' })
  async getXml(@Param('id', ParseUUIDPipe) id: string, @Res() res: Response) {
    const xml = await this.nfeService.getAuthorizedXml(id);
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.send(xml);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Consulta status da NF-e' })
  @ApiUnauthorizedResponse({ description: 'JWT ausente, expirado ou inválido' })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        numero: 1,
        status: 'autorizada',
        protocolo: 'PROT1730000123456',
        chaveAcesso: '1'.repeat(44),
      },
    },
  })
  @ApiParam({
    name: 'id',
    required: true,
    format: 'uuid',
    example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    description: 'ID retornado em POST /nfe',
  })
  getStatus(@Param('id', ParseUUIDPipe) id: string) {
    return this.nfeService.getStatus(id);
  }
}
