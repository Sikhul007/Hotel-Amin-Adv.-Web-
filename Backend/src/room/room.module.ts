import { Module } from '@nestjs/common';
import { RoomController } from './room.controller';
import { RoomService } from './room.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoomItem } from './entities/room-item.entity';
import { Rooms } from './entities/room.entity';


@Module({
  controllers: [RoomController],
  providers: [RoomService],
  imports: [TypeOrmModule.forFeature([RoomItem, Rooms])],
  exports: [TypeOrmModule]
})
export class RoomModule {}
