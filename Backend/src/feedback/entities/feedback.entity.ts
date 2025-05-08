import {Entity,Column,PrimaryGeneratedColumn,ManyToOne,JoinColumn,} from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Entity('Feedback')
export class Feedback {
  @PrimaryGeneratedColumn()
  feedback_id: number;

  @Column({ type: 'text' })
  feedback: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  date: Date;

  
  @Column({ name: 'user_id' })
  user_id: number;
   
  @ManyToOne(() => User, (user) => user.feedbacks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
  
  
}
