import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
} from 'typeorm';



@Entity('RoomItem')
export class RoomItem {
  @PrimaryGeneratedColumn()
  item_id: number;

  @Column({ type: 'varchar', length: 100 })
  item_name: string;


}
