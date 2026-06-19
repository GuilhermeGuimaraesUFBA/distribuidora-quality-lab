import { AggregateRoot } from '@shared/domain/aggregate-root';
import { ValidationException } from '@shared/domain/exceptions';
import { InventoryMovement } from '../entities/inventory-movement.entity';
import { StockBalance } from '../value-objects/stock-balance.vo';

export class ProductInventory extends AggregateRoot {
  private _productId: string;
  private _balance: StockBalance;

  get id(): string {
    return `inventory-${this._productId}`;
  }

  get productId(): string {
    return this._productId;
  }

  get balance(): StockBalance {
    return this._balance;
  }

  static load(productId: string, currentBalance: number): ProductInventory {
    ProductInventory.validateProductId(productId);

    const inventory = new ProductInventory();
    inventory._productId = productId;
    inventory._balance = StockBalance.create(currentBalance);

    return inventory;
  }

  withdraw(quantity: number, reason: string): InventoryMovement {
    this._balance = this._balance.subtract(quantity);

    return InventoryMovement.create({
      productId: this._productId,
      type: 'withdrawal',
      quantity,
      reason,
    });
  }

  addEntry(quantity: number): InventoryMovement {
    this._balance = this._balance.add(quantity);

    return InventoryMovement.create({
      productId: this._productId,
      type: 'entry',
      quantity,
    });
  }

  private static validateProductId(productId: string): void {
    if (!productId || productId.trim().length === 0) {
      throw new ValidationException('Product ID is required', {
        productId: ['productId must be a valid UUID'],
      });
    }
  }
}
