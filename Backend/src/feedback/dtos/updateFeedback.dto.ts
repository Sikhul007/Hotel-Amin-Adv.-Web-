import { IsString, IsOptional, IsInt } from 'class-validator';

export class UpdateFeedbackDto {
  @IsString()
  @IsOptional()
  feedback?: string;

}