import { Controller, Post, Body, Get, Param, Patch, Delete, ParseIntPipe } from '@nestjs/common';
import { RoomService } from './room.service';
import { CreateRoomDto } from './dtos/create-room.dto';
import { UpdateRoomDto } from './dtos/update-room.dto';
import { CreateRoomItemDto } from './dtos/create-room-item.dto';
import { RoomStatus } from './entities/room.entity';



@Controller('rooms')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  // Room endpoints
  @Post('create-room')
  async createRoom(@Body() dto: CreateRoomDto) {
    return this.roomService.createRoom(dto);
  }

  @Get('search-by-room-num/:room_num')
  async findRoomByRoomNum(@Param('room_num', ParseIntPipe) room_num: number) {
    return this.roomService.findRoomByRoomNum(room_num);
  }

  @Get('search-by-room-status/:room_status')
  async findRoomsByRoomStatus(@Param('room_status') room_status: RoomStatus) {
    return this.roomService.findRoomsByRoomStatus(room_status);
  }

  @Patch('update-room/:room_num')
  async updateRoom(@Param('room_num', ParseIntPipe) room_num: number, @Body() dto: UpdateRoomDto) {
    return this.roomService.updateRoom(room_num, dto);
  }

  //view all rooms
  @Get('all-rooms')
  async findAllRooms() {
    return this.roomService.findAllRooms();
  }



  // RoomItem endpoints
  @Post('create-room-item')
  async createRoomItem(@Body() dto: CreateRoomItemDto) {
    return this.roomService.createRoomItem(dto);
  }

  @Get('room-items/all')
  async findAllRoomItems() {
    return this.roomService.findAllRoomItems();
  }

  @Get('room-items/search-by-id/:item_id')
  async findRoomItemByItemId(@Param('item_id', ParseIntPipe) item_id: number) {
    return this.roomService.findRoomItemByItemId(item_id);
  }

  @Get('room-items/search-by-item-name/:item_name')
  async findRoomItemsByItemName(@Param('item_name') item_name: string) {
    return this.roomService.findRoomItemsByItemName(item_name);
  }

  //delete roomitem by room id
  @Delete('room-items/delete-by-id/:item_id')
  async deleteRoomItemById(@Param('item_id', ParseIntPipe) item_id: number) {
    return this.roomService.deleteRoomItemById(item_id);
  }

  //delete by room item name
  @Delete('room-items/delete-by-name/:item_name')
  async deleteRoomItemByName(@Param('item_name') item_name: string) {
    return this.roomService.deleteRoomItemByName(item_name);
  }


  

 
}