import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Product } from '../../products/entities/product.entity';
import { Nfe } from './nfe.entity';

@Entity('nfe_items')
export class NfeItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Nfe, (n) => n.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'nfe_id' })
  nfe: Nfe;

  @Column({ name: 'nfe_id', type: 'uuid' })
  nfeId: string;

  @ManyToOne(() => Product, { nullable: true })
  @JoinColumn({ name: 'product_id' })
  product: Product | null;

  @Column({ name: 'product_id', type: 'uuid', nullable: true })
  productId: string | null;

  @Column({ name: 'codigo_produto' })
  codigoProduto: string;

  @Column()
  descricao: string;

  @Column({ length: 8 })
  ncm: string;

  @Column({ length: 4 })
  cfop: string;

  @Column({ length: 3 })
  cst: string;

  @Column({ type: 'decimal', precision: 14, scale: 4 })
  quantidade: string;

  @Column({ name: 'valor_unitario', type: 'decimal', precision: 14, scale: 4 })
  valorUnitario: string;
}
