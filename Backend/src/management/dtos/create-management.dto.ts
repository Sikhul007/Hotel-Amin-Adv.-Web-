import { IsEmail, IsString, IsInt } from 'class-validator';

export class CreateManagementDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsInt()
  employee_id: number;
}
