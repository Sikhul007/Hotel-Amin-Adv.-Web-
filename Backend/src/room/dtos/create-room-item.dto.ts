import { IsNotEmpty, IsString} from "class-validator";
export class CreateRoomItemDto {

  @IsString()
    @IsNotEmpty()
    item_name: string;
    
  }