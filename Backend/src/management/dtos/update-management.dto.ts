import { IsEmail, IsString, IsOptional } from 'class-validator';

export class UpdateManagementDto {
  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  password?: string;
}
