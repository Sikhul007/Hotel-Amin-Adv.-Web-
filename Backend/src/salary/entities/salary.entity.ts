import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Employee } from '../../management/entities/employee.entity';
import { SalaryHistory } from './salary-history.entity';

@Entity('Salary')
export class Salary {
  @PrimaryGeneratedColumn()
  salary_id: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  //create employee_id column in employee table
  @Column({ type: 'int' })
  employee_id: number;

  @ManyToOne(() => Employee, (employee) => employee.salaries)
  @JoinColumn({ name: 'employee_id' })
  employee: Employee;

  @OneToMany(() => SalaryHistory, (history) => history.salary)
  salaryHistory: SalaryHistory[];
}
