import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { INVENTORY_REPOSITORY } from './domain/repositories/inventory.repository';
import { TypeOrmInventoryMovementEntity } from './infrastructure/persistence/typeorm-inventory-movement.entity';
import { TypeOrmInventoryRepository } from './infrastructure/persistence/typeorm-inventory.repository';
import { RegisterEntryUseCase } from './application/use-cases/register-entry.use-case';
import { RegisterWithdrawalUseCase } from './application/use-cases/register-withdrawal.use-case';
import { GetBalanceUseCase } from './application/use-cases/get-balance.use-case';
import { GetMovementHistoryUseCase } from './application/use-cases/get-movement-history.use-case';
import { InventoryController } from './interface/controllers/inventory.controller';
import { ProductModule } from '../product/product.module';

@Module({
  imports: [TypeOrmModule.forFeature([TypeOrmInventoryMovementEntity]), ProductModule],
  controllers: [InventoryController],
  providers: [
    {
      provide: INVENTORY_REPOSITORY,
      useClass: TypeOrmInventoryRepository,
    },
    RegisterEntryUseCase,
    RegisterWithdrawalUseCase,
    GetBalanceUseCase,
    GetMovementHistoryUseCase,
  ],
  exports: [INVENTORY_REPOSITORY],
})
export class InventoryModule {}
