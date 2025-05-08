import { EmployeeRole,EmployeeStatus } from '../entities/employee.entity';
import { IsEnum, IsString, IsOptional } from 'class-validator';

export class UpdateEmployeeDto  {

  @IsOptional()
  @IsEnum(EmployeeRole)
  role?: EmployeeRole;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEnum(EmployeeStatus)
  status?: EmployeeStatus;

}
