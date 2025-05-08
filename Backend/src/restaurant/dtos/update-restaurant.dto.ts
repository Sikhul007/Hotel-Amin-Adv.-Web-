import {
  IsOptional,
  IsString,
  IsNumber,
  IsEnum,
  IsBoolean,
} from 'class-validator';
import { FoodType } from '../entities/restaurant.entity';

export class UpdateRestaurantDto {
  @IsOptional()
  @IsString()
  item_name?: string;

  @IsOptional()
  @IsNumber()
  item_price?: number;

  @IsOptional()
  @IsEnum(FoodType)
  food_type?: FoodType;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  availability?: boolean;
}
