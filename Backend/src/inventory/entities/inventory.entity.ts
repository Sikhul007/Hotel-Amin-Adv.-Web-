import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Item } from './item.entity';
import { Employee } from '../../management/entities/employee.entity';

@Entity('Inventory')
export class Inventory {
  @PrimaryGeneratedColumn()
  inventory_id: number;

  @Column({ type: 'integer' })
  item_id: number;

  @ManyToOne(() => Item, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'item_id' })
  item: Item;

  @Column({ type: 'date' })
  date: Date;

  @Column({ type: 'integer' })
  previous_quantity: number;

  @Column({ type: 'integer' })
  used_quantity: number;

  @Column({ type: 'integer' })
  ordered_quantity: number;

  @Column({ type: 'integer' })
  current_quantity: number;

  @Column({ type: 'integer' })
  employee_id: number;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'employee_id' })
  employee: Employee;
}