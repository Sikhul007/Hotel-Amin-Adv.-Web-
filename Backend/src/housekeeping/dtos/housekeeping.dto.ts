import { IsInt, IsDateString, IsString, IsOptional, IsEnum } from 'class-validator';
import { ServiceType } from '../entities/housekeeping-history.entity';

export class CreateCleanupDto {
  @IsInt()
  room_num: number;

  @IsString()
  @IsOptional()
  issue_report?: string;

  @IsString()
  @IsOptional()
  cleaner_feedback?: string;

  @IsInt()
  cleaner_id: number;

  @IsInt()
  supervisor_employee_id: number;

  
}

export class CreateServiceRequestDto {

  @IsString()
  @IsOptional()
  issue_report?: string;

  @IsString()
  @IsOptional()
  cleaner_feedback?: string;

  @IsInt()
  cleaner_id: number;

  @IsInt()
  supervisor_employee_id: number;
}