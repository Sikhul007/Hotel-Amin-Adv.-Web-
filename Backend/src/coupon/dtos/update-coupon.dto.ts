import { IsNotEmpty, IsString, IsNumber, IsBoolean, IsDate, IsOptional } from 'class-validator';

export class UpdateCouponDto {
  @IsOptional()
  @IsString()
  coupon_code?: string;

  @IsOptional()
  @IsNumber()
  coupon_percent?: number;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  
}