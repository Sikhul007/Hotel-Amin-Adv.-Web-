import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateSalaryDto {
  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsNotEmpty()
  @IsNumber()
  employee_id: number;
}
