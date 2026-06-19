import { Injectable, Inject } from '@nestjs/common';
import {
  InventoryRepository,
  INVENTORY_REPOSITORY,
} from '../../domain/repositories/inventory.repository';
import { ProductRepository } from '../../../product/domain/repositories/product.repository';
import { ProductInventory } from '../../domain/aggregates/product-inventory.aggregate';
import { NotFoundException } from '@shared/domain/exceptions';

export interface RegisterWithdrawalInput {
  productId: string;
  quantity: number;
  reason: string;
}

export interface RegisterWithdrawalOutput {
  id: string;
  productId: string;
  type: string;
  quantity: number;
  reason: string;
  createdAt: Date;
}

@Injectable()
export class RegisterWithdrawalUseCase {
  constructor(
    @Inject(INVENTORY_REPOSITORY)
    private readonly inventoryRepository: InventoryRepository,
    @Inject('ProductRepository')
    private readonly productRepository: ProductRepository,
  ) {}

  async execute(input: RegisterWithdrawalInput): Promise<RegisterWithdrawalOutput> {
    const product = await this.productRepository.findById(input.productId);

    if (!product) {
      throw new NotFoundException(`Product with id ${input.productId} not found`);
    }

    const currentBalance = await this.inventoryRepository.getBalance(input.productId);
    const inventory = ProductInventory.load(input.productId, currentBalance);

    const movement = inventory.withdraw(input.quantity, input.reason);

    const saved = await this.inventoryRepository.save(movement);

    if (inventory.balance.isZero) {
      product.markAsUnavailable();
      await this.productRepository.save(product);
    }

    return {
      id: saved.id,
      productId: saved.productId,
      type: saved.type,
      quantity: saved.quantity,
      reason: saved.reason!,
      createdAt: saved.createdAt,
    };
  }
}
