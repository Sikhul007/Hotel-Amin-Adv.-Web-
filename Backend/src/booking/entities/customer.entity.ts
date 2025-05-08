import { Entity, Column, PrimaryGeneratedColumn, OneToMany, CreateDateColumn } from 'typeorm';
import { Booking } from './booking.entity';

@Entity('Customer')
export class Customer {
  @PrimaryGeneratedColumn()
  customer_id: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 20 })
  phone: string;

  @Column({ type: 'text', nullable: true })
  address?: string;

  @Column({ type: 'varchar', length: 50 })
  nid: string;

  @Column({ type: 'varchar', length: 50, nullable: false })
  nationality: string;

  @Column({ type: 'varchar', length: 50, nullable: false })
  Profession: string;

  @Column({ type: 'integer', nullable: false })
  age: number;

  @CreateDateColumn({type: 'timestamp',default: () => 'CURRENT_TIMESTAMP',})
  registrationDate: Date;


  @OneToMany(() => Booking, (booking) => booking.customer)
  bookings: Booking[];


}
