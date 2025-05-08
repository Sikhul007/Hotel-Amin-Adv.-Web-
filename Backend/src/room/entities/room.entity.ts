import { Entity, Column, PrimaryColumn, OneToMany } from 'typeorm';
import { RoomItem } from './room-item.entity';
import { HousekeepingHistory } from '../../housekeeping/entities/housekeeping-history.entity';


export enum RoomStatus {
  AVAILABLE = 'AVAILABLE',
  OCCUPIED = 'OCCUPIED',
  MAINTENANCE = 'MAINTENANCE',
}

export enum HousekeepingStatus {
  CLEAN = 'clean',
  WAITING_FOR_CLEAN = 'waiting_for_clean',
  NEEDS_SERVICE = 'needs_service',
}

@Entity('Rooms')
export class Rooms {
  @PrimaryColumn()
  room_num: number;

  @Column()
  floor: number;

  @Column()
  capacity: number;

  @Column({ type: 'varchar', length: 50 })
  type: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({type: 'decimal', precision: 10, scale: 2})
  room_price: number;

  @Column({type: 'decimal', precision: 5, scale: 2})
  discount: number;

  @Column({ type: 'enum', enum: RoomStatus })
  room_status: RoomStatus;

  @Column({ type: 'enum', enum: HousekeepingStatus })
  housekeeping_status: HousekeepingStatus;


  @OneToMany(() => HousekeepingHistory, (history) => history.room)
  housekeepingHistory: HousekeepingHistory[];

  
}
