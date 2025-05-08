import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Inventory } from './inventory.entity';

@Entity('Item')
export class Item {
  @PrimaryGeneratedColumn()
  item_id: number;

  @Column({ type: 'varchar', length: 100, unique: true })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  
  @OneToMany(() => Inventory, (inventory) => inventory.item)
  inventories: Inventory[];

}