import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  codigo: string;

  @Column()
  descricao: string;

  @Column({ length: 8 })
  ncm: string;

  @Column({ length: 6, default: 'UN' })
  unidade: string;
}
