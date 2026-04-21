import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { BadRequestException } from '@nestjs/common';
import { ErpFicticioService } from './erp/erp-ficticio.service';
import { NfeStatus } from './entities/nfe-status.enum';
import { Nfe } from './entities/nfe.entity';
import { NfeQueueService } from './nfe-queue.service';
import { NfeService } from './nfe.service';
import { NfeRepository } from './repository/nfe.repository';
import { CreateNfeDto } from './dto/create-nfe.dto';

describe('NfeService', () => {
  let service: NfeService;
  let erp: jest.Mocked<
    Pick<ErpFicticioService, 'getClientePorCnpj' | 'getProdutoPorCodigo'>
  >;
  let repo: jest.Mocked<
    Pick<NfeRepository, 'nextNumero' | 'create' | 'save' | 'findById'>
  >;
  let queue: jest.Mocked<Pick<NfeQueueService, 'enqueueEmission'>>;

  beforeEach(async () => {
    erp = {
      getClientePorCnpj: jest.fn(),
      getProdutoPorCodigo: jest.fn(),
    };
    repo = {
      nextNumero: jest.fn().mockResolvedValue(42),
      create: jest.fn((x) => ({ ...x, id: 'nfe-1' }) as Nfe),
      save: jest.fn((x: Nfe) => Promise.resolve(x)),
      findById: jest.fn(),
    };
    queue = { enqueueEmission: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NfeService,
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: (k: string) => {
              const map: Record<string, string> = {
                EMITENTE_CNPJ: '19131243000197',
                EMITENTE_IE: '111222333',
                EMITENTE_UF: 'SP',
              };
              return map[k] ?? '';
            },
          },
        },
        { provide: ErpFicticioService, useValue: erp },
        { provide: NfeRepository, useValue: repo },
        { provide: NfeQueueService, useValue: queue },
      ],
    }).compile();

    service = module.get(NfeService);
  });

  it('cria NF-e e enfileira emissão quando ERP confere', async () => {
    erp.getClientePorCnpj.mockResolvedValue({
      id: 'c1',
      cnpj: '11222333000181',
      ie: '123456789011',
      razaoSocial: 'Cliente',
      uf: 'SP',
    });
    erp.getProdutoPorCodigo.mockResolvedValue({
      id: 'p1',
      codigo: 'P001',
      descricao: 'Produto',
      ncm: '85234920',
      unidade: 'UN',
    });

    const dto: CreateNfeDto = {
      cnpjDestinatario: '11222333000181',
      ieDestinatario: '123456789011',
      ufDestinatario: 'SP',
      itens: [
        {
          codigoProduto: 'P001',
          quantidade: 2,
          valorUnitario: 10.5,
          cfop: '5102',
          cst: '00',
        },
      ],
    };

    const res = await service.create(dto);
    expect(res.numero).toBe(42);
    expect(res.status).toBe('processamento');
    expect(queue.enqueueEmission).toHaveBeenCalledWith('nfe-1');
  });

  it('rejeita divergência de IE com ERP', async () => {
    erp.getClientePorCnpj.mockResolvedValue({
      id: 'c1',
      cnpj: '11222333000181',
      ie: '999',
      razaoSocial: 'Cliente',
      uf: 'SP',
    });

    await expect(
      service.create({
        cnpjDestinatario: '11222333000181',
        ieDestinatario: '123',
        ufDestinatario: 'SP',
        itens: [],
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('retorna status da NF-e', async () => {
    repo.findById.mockResolvedValue({
      id: 'x',
      numero: 1,
      status: NfeStatus.AUTHORIZED,
      protocolNumber: 'PROT1',
      rejectionCode: null,
      rejectionMessage: null,
      accessKey: '1'.repeat(44),
    } as Nfe);

    const s = await service.getStatus('x');
    expect(s.status).toBe('autorizada');
    expect(s.protocolo).toBe('PROT1');
  });
});
