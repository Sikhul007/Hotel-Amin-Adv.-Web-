import { IsInt, IsNotEmpty, IsOptional, IsDateString, IsArray,IsString } from 'class-validator';

//creatinventoryitem dto
export class CreateInventoryItemDto {

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsOptional()
    description?: string;
}




export class InventoryItemDto {
  @IsInt()
  @IsNotEmpty()
  item_id: number;


  @IsInt()
  @IsNotEmpty()
  used_quantity: number;

  @IsInt()
  @IsNotEmpty()
  ordered_quantity: number;
}

export class CreateInventoryDto {
  @IsDateString()
  @IsNotEmpty()
  date: string;

  @IsInt()
  @IsNotEmpty()
  employee_id: number;

  @IsArray()
  @IsNotEmpty()
  items: InventoryItemDto[];
}

export class UpdateInventoryDto {
 
  @IsInt()
  @IsOptional()
  used_quantity?: number;

  @IsInt()
  @IsOptional()
  ordered_quantity?: number;
}

export class InventoryResponseDto {
  inventory_id: number;
  item_id: number;
  date: Date;
  previous_quantity: number;
  used_quantity: number;
  ordered_quantity: number;
  current_quantity: number;
  employee_id: number;
}

export class MonthlySummaryDto {
  @IsNotEmpty()
  month: string; // e.g., "2025-03"
}