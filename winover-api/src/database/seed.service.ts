import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from '../customers/entities/customer.entity';
import { Product } from '../products/entities/product.entity';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(Customer)
    private readonly customers: Repository<Customer>,
    @InjectRepository(Product)
    private readonly products: Repository<Product>,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    const c = await this.customers.count();
    if (c > 0) {
      return;
    }
    this.logger.log('Sem dados mestres — executando seed ERP fictício');

    await this.customers.save(
      this.customers.create({
        cnpj: '11222333000181',
        ie: '123456789011',
        razaoSocial: 'Cliente Mock ERP Ltda',
        uf: 'SP',
      }),
    );

    await this.products.save([
      this.products.create({
        codigo: 'P001',
        descricao: 'Licença de software',
        ncm: '85234920',
        unidade: 'UN',
      }),
      this.products.create({
        codigo: 'P002',
        descricao: 'Serviço de consultoria técnica',
        ncm: '62023000',
        unidade: 'UN',
      }),
    ]);
  }
}
