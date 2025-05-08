import { IsInt, IsDateString, IsArray, IsNumber, Min, IsEnum, IsOptional, IsString, IsBoolean, IsNotEmpty } from 'class-validator';
import { TypeOfBooking, PaymentStatus } from '../entities/booking.entity';
import { PaymentType } from '../entities/accounts.entity';

export class CreateInPersonBookingDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsNotEmpty()
  nid: string;

  @IsString()
  @IsNotEmpty()
  nationality: string;

  @IsString()
  @IsNotEmpty()
  Profession: string;

  @IsInt()
  @Min(1)
  age: number;

  @IsDateString()
  checkin_date: string;

  @IsDateString()
  checkout_date: string;

  @IsArray()
  @IsInt({ each: true })
  room_num: number[];

  @IsInt()
  @Min(1)
  number_of_guests: number;

  @IsString()
  @IsOptional()
  coupon_code?: string;

  @IsInt()
  employee_id: number;
}

export class CreateCheckinWithReservationDto {
  @IsInt()
  reservation_id: number;

  @IsString()
  @IsOptional()
  coupon_code?: string;

  @IsInt()
  employee_id: number;
}

export class UpdateBookingDto {
  @IsDateString()
  @IsOptional()
  checkout_date?: string;

  @IsBoolean()
  @IsOptional()
  is_checkedout?: boolean;

  @IsBoolean()
  @IsOptional()
  service_asked?: boolean;

  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  room_num?: number[];

  @IsString()
  @IsOptional()
  coupon_code?: string;
}


export class RoomServiceDto {
  @IsInt()
  booking_id: number;

  @IsArray()
  @IsInt({ each: true })
  room_num: number[];

  @IsString()
  @IsOptional()
  service_asked?: string;
}




export class CreateAccountDto {
  @IsNumber()
  @Min(0)
  paid: number;

  @IsEnum(PaymentType)
  payment_type: PaymentType;

  @IsString()
  @IsOptional()
  transaction_id?: string;
}

export class CheckoutDto {
  @IsInt()
  booking_id: number;
}

export class SearchByPaymentStatusDto {
  @IsEnum(PaymentStatus)
  payment_status: PaymentStatus;
}

export class SearchByTypeOfBookingDto {
  @IsEnum(TypeOfBooking)
  typeOfBooking: TypeOfBooking;
}

export class SearchByCouponCodeDto {
  @IsString()
  @IsNotEmpty()
  coupon_code: string;
}