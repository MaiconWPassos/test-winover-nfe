import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from './entities/customer.entity';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private readonly repo: Repository<Customer>,
  ) {}

  findByCnpj(cnpj: string): Promise<Customer | null> {
    const digits = cnpj.replace(/\D/g, '');
    return this.repo.findOne({ where: { cnpj: digits } });
  }
}
