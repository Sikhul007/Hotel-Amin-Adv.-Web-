import { IsString, IsEnum, IsNumber } from 'class-validator';
import { EmployeeRole } from '../entities/employee.entity';

export class CreateEmployeeDto {
  @IsString()
  name: string;

  @IsEnum(EmployeeRole)
  role: EmployeeRole;

  @IsString()
  phone: string;

  @IsString()
  nid: string;


  @IsNumber()
  salary: number;
 

}


