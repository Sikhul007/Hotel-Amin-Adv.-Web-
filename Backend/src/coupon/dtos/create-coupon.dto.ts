import { IsNotEmpty, IsString, IsNumber, IsBoolean, IsDate } from 'class-validator';

export class CreateCouponDto {
  

  @IsNotEmpty()
  @IsString()
  coupon_code: string;

  @IsNotEmpty()
  @IsNumber()
  coupon_percent: number;

  @IsNotEmpty()
  @IsBoolean()
  is_active: boolean;

 
}