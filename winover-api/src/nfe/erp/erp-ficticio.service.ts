import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { CustomersService } from '../../customers/customers.service';
import { Customer } from '../../customers/entities/customer.entity';
import { Product } from '../../products/entities/product.entity';
import { ProductsService } from '../../products/products.service';

/**
 * Integração com ERP fictício: dados mestres vêm do banco (simulando cadastro sincronizado).
 */
@Injectable()
export class ErpFicticioService {
  private readonly logger = new Logger(ErpFicticioService.name);

  constructor(
    private readonly customers: CustomersService,
    private readonly products: ProductsService,
  ) {}

  async getClientePorCnpj(cnpj: string): Promise<Customer> {
    const cliente = await this.customers.findByCnpj(cnpj);
    if (!cliente) {
      this.logger.warn({ cnpj }, 'Cliente não encontrado no ERP fictício');
      throw new BadRequestException('Cliente não cadastrado no ERP');
    }
    return cliente;
  }

  async getProdutoPorCodigo(codigo: string): Promise<Product> {
    const produto = await this.products.findByCodigo(codigo);
    if (!produto) {
      this.logger.warn({ codigo }, 'Produto não encontrado no ERP fictício');
      throw new BadRequestException(`Produto ${codigo} não cadastrado no ERP`);
    }
    return produto;
  }
}
