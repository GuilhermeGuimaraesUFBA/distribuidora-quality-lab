import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('inventory_movements')
export class TypeOrmInventoryMovementEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index('idx_inventory_movements_product_id')
  @Column({ name: 'product_id', type: 'uuid' })
  productId: string;

  @Column({ length: 10 })
  type: string;

  @Column({ type: 'integer' })
  quantity: number;

  @Column({ length: 255, nullable: true })
  reason: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
