import { Module } from '@nestjs/common';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Inventory } from './entities/inventory.entity';
import { ManagementModule } from '../management/management.module';
import { Item } from './entities/item.entity';
import { Employee } from 'src/management/entities/employee.entity';

@Module({
  controllers: [InventoryController],
  providers: [InventoryService],
  imports: [TypeOrmModule.forFeature([Inventory,Item,Employee]),ManagementModule],
})
export class InventoryModule {}
