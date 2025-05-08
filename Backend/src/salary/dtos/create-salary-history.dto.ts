import { IsNotEmpty, IsNumber, IsString, IsOptional } from 'class-validator';

export class CreateSalaryHistoryDto {


  @IsOptional()
  @IsNumber()
  bonus?: number;

  @IsNotEmpty()
  @IsNumber()
  employee_id: number;


  @IsNotEmpty()
  @IsNumber()
  paid_by_employee_id: number;

  @IsOptional()
  @IsNumber()
  totalSalary?: number;

  @IsOptional()
  @IsNumber()
  salary_id: number;

}
