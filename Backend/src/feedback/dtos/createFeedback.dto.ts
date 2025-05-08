import { IsString, IsNotEmpty, IsInt } from 'class-validator';

export class CreateFeedbackDto {
  @IsString()
  @IsNotEmpty()
  feedback: string;

  @IsInt()
  @IsNotEmpty()
  user_id: number;
}