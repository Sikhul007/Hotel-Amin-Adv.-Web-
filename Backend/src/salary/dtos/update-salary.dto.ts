import { IsOptional, IsNumber } from 'class-validator';

export class UpdateSalaryDto {

  @IsNumber()
  amount: number;
}
