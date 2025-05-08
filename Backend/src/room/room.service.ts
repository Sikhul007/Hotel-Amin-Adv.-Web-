import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { RoomStatus, Rooms } from './entities/room.entity';
import { RoomItem } from './entities/room-item.entity';
import { CreateRoomDto } from './dtos/create-room.dto';
import { UpdateRoomDto } from './dtos/update-room.dto';
import { CreateRoomItemDto } from './dtos/create-room-item.dto';



@Injectable()
export class RoomService {
  constructor(
    @InjectRepository(Rooms) private roomRepository: Repository<Rooms>,
    @InjectRepository(RoomItem) private roomItemRepository: Repository<RoomItem>,
  ) {}

  // Room-related methods
  async createRoom(dto: CreateRoomDto) {
    const existingRoom = await this.roomRepository.findOne({ where: { room_num: dto.room_num } });
    if (existingRoom) {
      return {message: 'Room already exists' };
    }
    const room = this.roomRepository.create(dto);
    await this.roomRepository.save(room);
    return { message: 'Room created successfully'};
  }

  async findRoomByRoomNum(room_num: number) {
    const room = await this.roomRepository.findOne({ where: { room_num: room_num }});
    if (!room) {
      return { message: 'Room not found' };
    }
    return room;
  }

  // Find rooms by status
  async findRoomsByRoomStatus(room_status: RoomStatus) {
    const room = await this.roomRepository.find({ where: { room_status: room_status}});
    if (!room) {
      return { message: 'Room not found' };
    }
    return room;
  }

  async updateRoom(room_num: number, dto: UpdateRoomDto) {
    const room = await this.roomRepository.findOne({ where: { room_num : room_num} });
    if (!room) {
      return { message: 'Room not found' };
    }
    Object.assign(room, dto);
    return this.roomRepository.save(room);
  }

  // RoomItem-related methods
  async createRoomItem(dto: CreateRoomItemDto) {
    const existingItem = await this.roomItemRepository.findOne({ where: { item_name: dto.item_name } }); 
    if (existingItem) {
      return { message: 'Item already exists' };
    }
   
    const roomItem = this.roomItemRepository.create(dto);
    await this.roomItemRepository.save(roomItem);
    return { message: 'Room item created successfully' };

  }

  async findAllRoomItems() {
    return this.roomItemRepository.find();
  }

  async findRoomItemByItemId(item_id: number) {
    const roomItem = await this.roomItemRepository.findOne({ where: { item_id: item_id } });
    if (!roomItem) {
      return { message: 'Room item not found' };
    }
    return roomItem;
  }

  async findRoomItemsByItemName(item_name: string){
    const roomItems = await this.roomItemRepository.find({ where: { item_name: item_name } });
    if (roomItems.length === 0) {
      return { message: 'Room items not found' };
    }
    return roomItems;
  }

  async deleteRoomItemById(item_id: number) {
    const roomItem = await this.roomItemRepository.findOne({ where: { item_id: item_id } });
    if (!roomItem) {
      return { message: 'Room item not found' };
    }
    await this.roomItemRepository.remove(roomItem);
    return { message: 'Room item deleted successfully' };
  }

  //delete room item by nam, but not case sensitive
  async deleteRoomItemByName(item_name: string) {
    const roomItem = await this.roomItemRepository.findOne({where: {item_name: ILike(`%${item_name}%`)}});
    if (!roomItem) {
      return { message: 'Room item not found' };
    }
    await this.roomItemRepository.remove(roomItem);
    return { message: 'Room item deleted successfully' };
  }

  async findAllRooms() {
    return this.roomRepository.find();
  }

  
}