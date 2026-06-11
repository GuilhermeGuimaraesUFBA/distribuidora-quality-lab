import { Entity as DomainEntity } from '@shared/domain/entity';
import { ValidationException } from '@shared/domain/exceptions';

export type MovementType = 'entry' | 'withdrawal';

interface CreateMovementProps {
  productId: string;
  type: MovementType;
  quantity: number;
  reason?: string;
}

interface RestoreMovementProps {
  id: string;
  productId: string;
  type: MovementType;
  quantity: number;
  reason: string | null;
  createdAt: Date;
}

export class InventoryMovement extends DomainEntity {
  private _id: string;

  private _productId: string;

  private _type: string;

  private _quantity: number;

  private _reason: string | null;

  private _createdAt: Date;

  get id(): string {
    return this._id;
  }

  get productId(): string {
    return this._productId;
  }

  get type(): MovementType {
    return this._type as MovementType;
  }

  get quantity(): number {
    return this._quantity;
  }

  get reason(): string | null {
    return this._reason;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  static create(props: CreateMovementProps): InventoryMovement {
    InventoryMovement.validateProductId(props.productId);
    InventoryMovement.validateType(props.type);
    InventoryMovement.validateQuantity(props.quantity);
    InventoryMovement.validateReason(props.type, props.reason);

    const movement = new InventoryMovement();
    movement._productId = props.productId;
    movement._type = props.type;
    movement._quantity = props.quantity;
    movement._reason = props.reason ?? null;

    return movement;
  }

  static restore(props: RestoreMovementProps): InventoryMovement {
    InventoryMovement.validateIdentity(props.id);
    InventoryMovement.validateProductId(props.productId);
    InventoryMovement.validateType(props.type);
    InventoryMovement.validateQuantity(props.quantity);
    InventoryMovement.validateReason(props.type, props.reason ?? undefined);
    InventoryMovement.validateCreatedAt(props.createdAt);

    const movement = new InventoryMovement();
    movement._id = props.id;
    movement._productId = props.productId;
    movement._type = props.type;
    movement._quantity = props.quantity;
    movement._reason = props.reason;
    movement._createdAt = props.createdAt;

    return movement;
  }

  private static validateIdentity(id: string): void {
    if (!id || id.trim().length === 0) {
      throw new ValidationException('Movement ID is required', {
        id: ['id must be a valid UUID'],
      });
    }
  }

  private static validateProductId(productId: string): void {
    if (!productId || productId.trim().length === 0) {
      throw new ValidationException('Product ID is required', {
        productId: ['productId must be a valid UUID'],
      });
    }
  }

  private static validateType(type: string): void {
    if (type !== 'entry' && type !== 'withdrawal') {
      throw new ValidationException('Invalid movement type', {
        type: ['type must be either "entry" or "withdrawal"'],
      });
    }
  }

  private static validateQuantity(quantity: number): void {
    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new ValidationException('Invalid quantity', {
        quantity: ['quantity must be a positive integer greater than 0'],
      });
    }
  }

  private static validateReason(type: MovementType, reason?: string): void {
    if (type === 'withdrawal' && (!reason || reason.trim().length === 0)) {
      throw new ValidationException('Reason is required for withdrawals', {
        reason: ['reason is required when type is "withdrawal"'],
      });
    }
  }

  private static validateCreatedAt(createdAt: Date): void {
    if (!(createdAt instanceof Date) || Number.isNaN(createdAt.getTime())) {
      throw new ValidationException('Movement creation date is invalid', {
        createdAt: ['createdAt must be a valid Date'],
      });
    }
  }
}
