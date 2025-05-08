import { IsNotEmpty, IsInt, IsObject, IsString } from 'class-validator';

class ItemQuantity {
  @IsNotEmpty()
  @IsString()
  itemName: string;

  @IsNotEmpty()
  @IsInt()
  quantity: number;
}

export class CreateRestaurantHistoryDto {
  @IsObject()
  @IsNotEmpty()
  items: { [key: string]: number };

  @IsInt()
  @IsNotEmpty()
  booking_id: number;

  @IsInt()
  @IsNotEmpty()
  food_id: number;

  @IsInt()
  @IsNotEmpty()
  employee_id: number;
}
