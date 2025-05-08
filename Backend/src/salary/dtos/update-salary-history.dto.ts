import { IsOptional, IsNumber, IsString } from 'class-validator';

export class UpdateSalaryHistoryDto {
  @IsOptional()
  @IsString()
  action_type?: string;

  @IsOptional()
  @IsNumber()
  bonus?: number;

  @IsOptional()
  @IsNumber()
  employee_id?: number;

  @IsOptional()
  @IsNumber()
  recorded_by_employee_id?: number;

  @IsOptional()
  @IsNumber()
  salary_id?: number;
}
