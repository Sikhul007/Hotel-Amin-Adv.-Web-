import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Inventory } from './entities/inventory.entity';
import { Item } from './entities/item.entity';
import { Employee } from '../management/entities/employee.entity';
import { CreateInventoryDto, UpdateInventoryDto,  MonthlySummaryDto,CreateInventoryItemDto } from './dtos/inventory.dto';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Inventory) private inventoryRepository: Repository<Inventory>,
    @InjectRepository(Item) private itemRepository: Repository<Item>,
    @InjectRepository(Employee) private employeeRepository: Repository<Employee>,
  ) {}


 

    async createItem(dto: CreateInventoryItemDto) {
        const existingItem = await this.itemRepository.findOneBy({ name: dto.name });
    if (existingItem) {
      return { message: 'Item with this name already exists' };
    }
    const item = this.itemRepository.create(dto);
    await this.itemRepository.save(item);
    return { message: 'Item created successfully'};
    }


    async findAll() {
        const items = await this.itemRepository.find();
        if (items.length === 0) {
          return { message: 'No items found' };
        }
        return items;
      }


        async deleteItem(id: number) {
            const item = await this.itemRepository.findOneBy({ item_id: id });
            if (!item) {
            return { message: 'Item not found' };
            }
            await this.itemRepository.delete(id);
            return { message: 'Item deleted successfully' };
        }



    async create(dto: CreateInventoryDto) {
        const employee = await this.employeeRepository.findOneBy({ employee_id: dto.employee_id });
        if (!employee) {
          return { message: 'Employee not found' };
        }
    
        const date = new Date(dto.date);
        const prevDate = new Date(date);
        prevDate.setDate(date.getDate() - 1);


        for (const itemDto of dto.items) {
            const item = await this.itemRepository.findOneBy({ item_id: itemDto.item_id });
            if (!item) {
                return { message: 'Item not found' };
            } 
        }
        for (const itemDto of dto.items) {
            const existingInventory = await this.inventoryRepository.findOne({
                where: { item_id: itemDto.item_id, date },
            });
            if (existingInventory) {
                return { message: 'Inventory record already exists for this item and date' };
            }
        }
    
        
        for (const itemDto of dto.items) {
          
          let previous_quantity = 0;
         // Default for first day

          const prevInventory = await this.inventoryRepository.findOne({
            where: { item_id: itemDto.item_id, date: prevDate },
          });
          if (prevInventory) {
            previous_quantity = prevInventory.current_quantity;
          }else {
            previous_quantity = itemDto.ordered_quantity; 
            itemDto.ordered_quantity = 0; // Set used_quantity to 0 if no previous inventory
          }
    
          const current_quantity = previous_quantity - itemDto.used_quantity + itemDto.ordered_quantity;
          
          const inventory = this.inventoryRepository.create({
            item_id: itemDto.item_id,
            date,
            previous_quantity,
            used_quantity: itemDto.used_quantity,
            ordered_quantity: itemDto.ordered_quantity,
            current_quantity,
            employee,
          });
          await this.inventoryRepository.save(inventory);
        }
    
        return {message: 'Inventory created successfully' };
      }
    
      async findByDate(date: string) {
        const inventories = await this.inventoryRepository.find({
          where: { date: new Date(date) },
        });
        if (inventories.length === 0) {
          return { message: 'No inventory found for this date' };
        }
        return {
              inventories: inventories.map(inventory => ({
              inventory_id: inventory.inventory_id,
              item_id: inventory.item_id,
              date: inventory.date,
              previous_quantity: inventory.previous_quantity,
              used_quantity: inventory.used_quantity,
              ordered_quantity: inventory.ordered_quantity,
              current_quantity: inventory.current_quantity,
              employee_id: inventory.employee_id,
            })),
          };
      }
    
      async update(id: number, dto: UpdateInventoryDto) {
        const inventory = await this.inventoryRepository.findOne({ where: { inventory_id: id } });
        if (!inventory) {
          return { message: 'Inventory not found' };
        }
    
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Normalize to start of day

        const inventoryDate = new Date(inventory.date);
        inventoryDate.setHours(0, 0, 0, 0);
    
        if (inventoryDate.getTime() !== today.getTime()) {
          return { message: 'Can only update today’s inventory' };
        }
    
        if (dto.used_quantity !== undefined) {
            inventory.used_quantity = dto.used_quantity;
          }
          if (dto.ordered_quantity !== undefined) {
            inventory.ordered_quantity = dto.ordered_quantity;
          }
          inventory.current_quantity = inventory.previous_quantity - inventory.used_quantity + inventory.ordered_quantity;
        await this.inventoryRepository.save(inventory);
        return { message: 'Inventory updated successfully' };
        }
    
       
     
    
      async getMonthlySummary(dto: MonthlySummaryDto) {
        const [year, month] = dto.month.split('-').map(Number);
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);
        const inventories = await this.inventoryRepository.find({
          where: { date: Between(startDate, endDate) },
          relations: ['item'],
        });
        if (inventories.length === 0) {
          return { message: 'No inventory found for this month' };
        }
    
        // Group by item_id and item_name
        const groupedByItem = inventories.reduce((acc, inventory) => {
          const itemId = inventory.item_id;
          const itemName = inventory.item.name;
          if (!acc[itemId]) {
            acc[itemId] = { item_name: itemName, total_used: 0 };
          }
          acc[itemId].total_used += inventory.used_quantity;
          return acc;
        }, {});
    
        // Format response
        const summaries = Object.values(groupedByItem);
    
        return {
          month: dto.month,
          summaries,
        };
      }
}