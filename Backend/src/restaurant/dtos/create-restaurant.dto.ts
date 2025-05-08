import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  IsBoolean,
} from 'class-validator';
import { FoodType } from '../entities/restaurant.entity';

export class CreateRestaurantDto {
  @IsNotEmpty()
  @IsString()
  item_name: string;

  @IsNotEmpty()
  @IsNumber()
  item_price: number;

  @IsNotEmpty()
  @IsEnum(FoodType)
  food_type: FoodType;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  availability?: boolean;
}
