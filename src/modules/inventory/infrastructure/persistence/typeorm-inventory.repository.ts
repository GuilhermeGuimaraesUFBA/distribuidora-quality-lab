import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository as TypeOrmRepo } from 'typeorm';
import { InventoryMovement } from '../../domain/entities/inventory-movement.entity';
import { InventoryRepository } from '../../domain/repositories/inventory.repository';
import { TypeOrmInventoryMovementEntity } from './typeorm-inventory-movement.entity';

@Injectable()
export class TypeOrmInventoryRepository implements InventoryRepository {
  constructor(
    @InjectRepository(TypeOrmInventoryMovementEntity)
    private readonly ormRepository: TypeOrmRepo<TypeOrmInventoryMovementEntity>,
  ) {}

  async findMovementsByProductId(productId: string): Promise<InventoryMovement[]> {
    const movements = await this.ormRepository.find({
      where: { productId },
      order: { createdAt: 'ASC' },
    });

    return movements.map((movement) => this.toDomain(movement));
  }

  async save(movement: InventoryMovement): Promise<InventoryMovement> {
    const saved = await this.ormRepository.save(this.toPersistence(movement));

    return this.toDomain(saved);
  }

  async getBalance(productId: string): Promise<number> {
    const result = await this.ormRepository
      .createQueryBuilder('m')
      .select(
        `COALESCE(SUM(CASE WHEN m.type = 'entry' THEN m.quantity ELSE -m.quantity END), 0)`,
        'balance',
      )
      .where('m.productId = :productId', { productId })
      .getRawOne<{ balance: string }>();

  return Number(result?.balance ?? 0);
  }

  private toDomain(entity: TypeOrmInventoryMovementEntity): InventoryMovement {
    return InventoryMovement.restore({
      id: entity.id,
      productId: entity.productId,
      type: entity.type as 'entry' | 'withdrawal',
      quantity: entity.quantity,
      reason: entity.reason,
      createdAt: entity.createdAt,
    });
  }

  private toPersistence(movement: InventoryMovement): TypeOrmInventoryMovementEntity {
    const entity = new TypeOrmInventoryMovementEntity();

    if (movement.id) {
      entity.id = movement.id;
    }

    entity.productId = movement.productId;
    entity.type = movement.type;
    entity.quantity = movement.quantity;
    entity.reason = movement.reason;

    if (movement.createdAt) {
      entity.createdAt = movement.createdAt;
    }

    return entity;
  }
}
