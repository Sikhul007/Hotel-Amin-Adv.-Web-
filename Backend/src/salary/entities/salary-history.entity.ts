import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Employee } from '../../management/entities/employee.entity';
import { Salary } from './salary.entity';

@Entity('SalaryHistory')
export class SalaryHistory {
  @PrimaryGeneratedColumn()
  history_id: number;

  // default value is paymen"
  @Column({ type: 'text', default: 'payment' })
  action_type: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  bonus: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalSalary: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  timestamp: Date;



  @Column({ type: 'int' })
  employee_id: number;

  @ManyToOne(() => Employee, (employee) => employee.salaryHistory)
  @JoinColumn({ name: 'employee_id' })
  employee: Employee;



  @ManyToOne(() => Employee, (employee) => employee.salaryHistoryRecorded)
  @JoinColumn({ name: 'paid_by_employee_id' })
  recorded_by: Employee;



  @Column({ type: 'int'})
  salary_id: number;

  @ManyToOne(() => Salary, (salary) => salary.salaryHistory)
  @JoinColumn({ name: 'salary_id' })
  salary: Salary;
}
