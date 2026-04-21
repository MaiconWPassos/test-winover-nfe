import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('customers')
export class Customer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 14 })
  cnpj: string;

  @Column({ length: 20 })
  ie: string;

  @Column({ name: 'razao_social' })
  razaoSocial: string;

  @Column({ length: 2 })
  uf: string;
}
