import { Controller, Get, Post, Body, Param, ParseIntPipe, ParseEnumPipe } from '@nestjs/common';
import { HousekeepingService } from './housekeeping.service';
import { CreateCleanupDto, CreateServiceRequestDto } from './dtos/housekeeping.dto';
import { HousekeepingHistory, ServiceType } from './entities/housekeeping-history.entity';
import { Rooms } from '../room/entities/room.entity';
import { HousekeepingStatus } from '../room/entities/room.entity';

@Controller('housekeeping')
export class HousekeepingController {
  constructor(private readonly housekeepingService: HousekeepingService) {}

  @Get('rooms/:status')
  async getRoomsByStatus(
    @Param('status', new ParseEnumPipe(HousekeepingStatus)) status: HousekeepingStatus,
  ){
    return this.housekeepingService.getRoomsByHousekeepingStatus(status);
  }

  @Post('cleanup')
  async createCleanup(@Body() dto: CreateCleanupDto){
    return this.housekeepingService.createCleanup(dto);
  }


  // view all rooms service
  @Get('rooms')
  async getAllRooms(){
    return this.housekeepingService.getAllRooms();
  }
 

  @Post('service/:roomNum')
  async createServiceRequest(
    @Param('roomNum', ParseIntPipe) roomNum: number,
    @Body() dto: CreateServiceRequestDto,
  ){
    return this.housekeepingService.createServiceRequest(roomNum, dto);
  }


  //view the housekeeping history
  @Get('history')
  async getHousekeepingHistory(){
    return this.housekeepingService.getHousekeepingHistory();
  }


//view the history of a specific date
  @Get('history/:date')
  async getHousekeepingHistoryByDate(@Param('date') date: string){
    return this.housekeepingService.getHousekeepingHistoryByDate(date);
  }


  //filter the history by type of service, which is enum
  @Get('history/type/:type')
  async getHousekeepingHistoryByServiceType(@Param('type', new ParseEnumPipe(ServiceType)) type: ServiceType,){
    return this.housekeepingService.getHousekeepingHistoryByServiceType(type);
  }
  

}