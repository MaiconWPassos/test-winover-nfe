import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Customer } from '../../customers/entities/customer.entity';
import { User } from '../../users/entities/user.entity';
import { NfeItem } from './nfe-item.entity';
import { NfeStatus } from './nfe-status.enum';

@Entity('nfes')
export class Nfe {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int' })
  numero: number;

  @Column({ type: 'enum', enum: NfeStatus, default: NfeStatus.PROCESSING })
  status: NfeStatus;

  @Column({ name: 'access_key', type: 'varchar', length: 44, nullable: true })
  accessKey: string | null;

  @Column({ name: 'emit_cnpj', type: 'varchar', length: 14 })
  emitCnpj: string;

  @Column({ name: 'emit_ie', type: 'varchar', length: 20 })
  emitIe: string;

  @Column({ name: 'emit_uf', type: 'varchar', length: 2 })
  emitUf: string;

  @Column({ name: 'authorized_xml', type: 'text', nullable: true })
  authorizedXml: string | null;

  @Column({
    name: 'protocol_number',
    type: 'varchar',
    length: 64,
    nullable: true,
  })
  protocolNumber: string | null;

  @Column({
    name: 'rejection_code',
    type: 'varchar',
    length: 32,
    nullable: true,
  })
  rejectionCode: string | null;

  @Column({ name: 'rejection_message', type: 'text', nullable: true })
  rejectionMessage: string | null;

  @ManyToOne(() => Customer, { eager: true })
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @Column({ name: 'customer_id', type: 'uuid' })
  customerId: string;

  @ManyToOne(() => User, { eager: false, nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: User | null;

  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId: string | null;

  @OneToMany(() => NfeItem, (i) => i.nfe, { cascade: true, eager: true })
  items: NfeItem[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
