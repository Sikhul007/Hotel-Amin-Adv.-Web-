import { Entity, Column, PrimaryGeneratedColumn, OneToMany, CreateDateColumn } from 'typeorm';
import { Feedback } from '../../feedback/entities/feedback.entity';
import { Reservation } from '../../reservation/entities/reservation.entity';

@Entity('User')
export class User {
  @PrimaryGeneratedColumn()
  user_id: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  password: string;

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

  @Column({ type: 'varchar', length: 50, default: 'user'})
  role: string;


  @OneToMany(() => Feedback, (feedback) => feedback.user)
  feedbacks: Feedback[];

  @OneToMany(() => Reservation, (reservation) => reservation.user)
  reservations: Reservation[];
}
