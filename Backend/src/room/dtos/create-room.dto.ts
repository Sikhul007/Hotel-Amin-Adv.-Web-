import { IsNotEmpty, IsString , IsNumber,IsEnum} from "class-validator";
import { RoomStatus} from '../entities/room.entity'
import { HousekeepingStatus } from '../entities/room.entity'
export class CreateRoomDto {
 
    @IsNumber()
    @IsNotEmpty()
    room_num: number;

    @IsNotEmpty()
    @IsNumber()
    floor: number;

    @IsNotEmpty()
    @IsNumber()
    capacity: number;

    @IsNotEmpty()
    @IsString()
    type: string;

    @IsNotEmpty()
    @IsString()
    description: string;

    
    @IsNumber()
    room_price: number;

    @IsNumber()
    discount: number;

    @IsEnum(RoomStatus)
    room_status: RoomStatus;
    
    @IsEnum(HousekeepingStatus)
    housekeeping_status:HousekeepingStatus ;
  }