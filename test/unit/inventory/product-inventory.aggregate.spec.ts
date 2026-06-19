import { ProductInventory } from '@modules/inventory/domain/aggregates/product-inventory.aggregate';
import { BusinessRuleException, ValidationException } from '@shared/domain/exceptions';

describe('ProductInventory Aggregate', () => {
  const validProductId = '660e8400-e29b-41d4-a716-446655440000';

  describe('load', () => {
    it('should successfully load an inventory with valid product id and balance', () => {
      const inventory = ProductInventory.load(validProductId, 10);

      expect(inventory.productId).toBe(validProductId);
      expect(inventory.balance.value).toBe(10);
    });

    it('should throw ValidationException if productId is invalid', () => {
      expect(() => ProductInventory.load('', 10)).toThrow(ValidationException);
    });

    it('should throw BusinessRuleException if balance is negative', () => {
      expect(() => ProductInventory.load(validProductId, -5)).toThrow(BusinessRuleException);
    });
  });

  describe('withdraw', () => {
    it('should successfully generate withdrawal movement and update balance', () => {
      const inventory = ProductInventory.load(validProductId, 10);

      const movement = inventory.withdraw(3, 'Sale');

      expect(movement.type).toBe('withdrawal');
      expect(movement.quantity).toBe(3);
      expect(movement.reason).toBe('Sale');
      expect(inventory.balance.value).toBe(7);
    });

    it('should throw BusinessRuleException if withdrawal exceeds balance', () => {
      const inventory = ProductInventory.load(validProductId, 10);

      expect(() => inventory.withdraw(15, 'Sale')).toThrow(BusinessRuleException);
      expect(inventory.balance.value).toBe(10);
    });

    it('should throw ValidationException if reason is empty', () => {
      const inventory = ProductInventory.load(validProductId, 10);

      expect(() => inventory.withdraw(3, '')).toThrow(ValidationException);
    });
  });

  describe('addEntry', () => {
    it('should successfully generate entry movement and update balance', () => {
      const inventory = ProductInventory.load(validProductId, 10);

      const movement = inventory.addEntry(5);

      expect(movement.type).toBe('entry');
      expect(movement.quantity).toBe(5);
      expect(movement.reason).toBeNull();
      expect(inventory.balance.value).toBe(15);
    });
  });
});
