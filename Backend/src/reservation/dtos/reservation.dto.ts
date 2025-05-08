import { IsInt, IsNotEmpty, IsDateString, IsArray, IsPositive } from 'class-validator';

export class CreateReservationDto {
  @IsInt()
  @IsNotEmpty()
  user_id: number;

  @IsDateString()
  @IsNotEmpty()
  checkin_date: string;

  @IsDateString()
  @IsNotEmpty()
  checkout_date: string;

  @IsInt()
  @IsPositive()
  number_of_guests: number;

  @IsArray()
  @IsNotEmpty()
  @IsInt({ each: true })
  room_num: number[];
}
