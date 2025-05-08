import {Entity,Column,PrimaryGeneratedColumn,ManyToOne,JoinColumn,} from 'typeorm';
import { User } from '../../user/entities/user.entity';



@Entity('Reservation')
export class Reservation {
  @PrimaryGeneratedColumn()
  reservation_id: number;

  @Column({ type: 'date' })
  checkin_date: Date;

  @Column({ type: 'date' })
  checkout_date: Date;

  @Column()
  number_of_guests: number;

  @Column('int', { array: true })
  room_num: number[];

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total_price: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  booking_date: Date;

  @Column({ type: 'varchar', default: 'website' })
  typeOfBooking: string;

  @Column({ type: 'int' })
  user_id: number;

  @ManyToOne(() => User, (user) => user.reservations, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}