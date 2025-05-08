import { Controller, Post, Body, Get, Param, Patch, Delete, ParseIntPipe } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { CreateInventoryDto, UpdateInventoryDto, MonthlySummaryDto, CreateInventoryItemDto } from './dtos/inventory.dto';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post('createitem')
  async createItem(@Body() dto: CreateInventoryItemDto) {
    return this.inventoryService.createItem(dto);
  }

  //view all inventory items
  @Get('viewiteminventory')
  async findAll() {
    return this.inventoryService.findAll();
 }

 //delete item
    @Delete('deleteitem/:id')
    async deleteItem(@Param('id', ParseIntPipe) id: number) {
      return this.inventoryService.deleteItem(id);
    }


  @Post('createinventory')
  async create(@Body() dto: CreateInventoryDto) {
    return this.inventoryService.create(dto);
  }

 

  @Get('searchbydate/:date')
  async findByDate(@Param('date') date: string) {
    return this.inventoryService.findByDate(date);
  }
 
  @Patch('inventoryupdate/:id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateInventoryDto) {
    return this.inventoryService.update(id, dto);
  }

  


  @Post('monthlysummary')
  async getMonthlySummary(@Body() dto: MonthlySummaryDto) {
    return this.inventoryService.getMonthlySummary(dto);
  }
}