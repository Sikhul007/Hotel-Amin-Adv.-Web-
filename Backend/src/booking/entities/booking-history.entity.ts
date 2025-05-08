import {Entity,Column,PrimaryGeneratedColumn,ManyToOne,OneToMany,JoinColumn, PrimaryColumn,} from 'typeorm';
import { Employee } from '../../management/entities/employee.entity';
import { Rooms } from '../../room/entities/room.entity';
import { Coupon } from '../../coupon/entities/coupon.entity';
import { Accounts } from './accounts.entity';
import { RestaurantHistory } from '../../restaurant/entities/restaurant-history.entity';
import { CouponUsage } from '../../coupon/entities/coupon-usage.entity';
import { HousekeepingHistory } from '../../housekeeping/entities/housekeeping-history.entity';
import { Customer } from './customer.entity';

export enum PaymentStatus {
  PENDING = 'pending',
  PARTIAL = 'partial',
  PAID = 'paid',
}

export enum TypeOfBooking {
  WEBSITE = 'website',
  SELF = 'self',
}

@Entity('BookingHistory')
export class BookingHistory {
  @PrimaryColumn()
  booking_id: number;
 
  //customer colum
  @Column({ type: 'int', nullable: false })
  customer_id: number;

  @ManyToOne(() => Customer, (customer) => customer.bookings)
  @JoinColumn({ name: 'customer_id' })


  @Column({ type: 'date' })
  checkin_date: Date;

  @Column({ type: 'date' })
  checkout_date: Date;

  @Column('int', { array: true })
  room_num: number[];

  @Column()
  number_of_guests: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  room_price: number;

  @ManyToOne(() => Coupon, (coupon) => coupon.bookings, { nullable: true })
  @JoinColumn({ name: 'coupon_id' })
  coupon?: Coupon;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  coupon_percent?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total_price: number;

  @Column({ type: 'enum', enum: PaymentStatus })
  payment_status: PaymentStatus;

  @Column({ type: 'timestamp',  })
  booking_date: Date;

  @Column({ type: 'enum', enum: TypeOfBooking })
  typeOfBooking: TypeOfBooking;

  @Column({ type: 'boolean', default: false })
  service_asked: boolean;

  //is checkout
  @Column({ type: 'boolean', default: false })
  is_checkedout: boolean;


  @ManyToOne(() => Employee, (employee) => employee.bookings)
  @JoinColumn({ name: 'checkedin_by' })
  employee: Employee;


  // @OneToMany(() => Accounts, (account) => account.booking)
  // accounts: Accounts[];

  @OneToMany(() => RestaurantHistory, (history) => history.booking)
  restaurantHistory: RestaurantHistory[];

  @OneToMany(() => CouponUsage, (couponUsage) => couponUsage.booking)
  couponUsages: CouponUsage[];

  @OneToMany(() => HousekeepingHistory, (history) => history.booking)
  housekeepingHistory: HousekeepingHistory[];
    customer: any;
}
