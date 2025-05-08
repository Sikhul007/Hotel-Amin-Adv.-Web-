import { IsNotEmpty, IsString , IsInt,IsEnum,IsNumber, IsOptional} from "class-validator";
import { RoomStatus} from '../entities/room.entity'
import { HousekeepingStatus } from '../entities/room.entity'

export class UpdateRoomDto  {

        @IsOptional()
        @IsInt()
        capacity?: number;
    
        @IsOptional()
        @IsString()
        type?: string;

        @IsOptional()
        @IsString()
        description?: string;
    
        @IsOptional()
        @IsNumber()
        room_price?: number;
    
        @IsOptional()
        @IsInt()
        discount?: number;
    
        @IsOptional()
        @IsEnum(RoomStatus)
        room_status?: RoomStatus;
        
        @IsOptional()
        @IsEnum(HousekeepingStatus)
        housekeeping_status?:HousekeepingStatus ;
}