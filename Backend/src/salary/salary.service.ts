import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Salary } from './entities/salary.entity';
import { SalaryHistory } from './entities/salary-history.entity';
import { Employee } from '../management/entities/employee.entity';
import { CreateSalaryDto } from './dtos/create-salary.dto';
import { UpdateSalaryDto } from './dtos/update-salary.dto';
import { CreateSalaryHistoryDto } from './dtos/create-salary-history.dto';
import { UpdateSalaryHistoryDto } from './dtos/update-salary-history.dto';
import { Raw } from 'typeorm';

@Injectable()
export class SalaryService {
  constructor(
    @InjectRepository(Salary)
    private salaryRepository: Repository<Salary>,
    @InjectRepository(SalaryHistory)
    private salaryHistoryRepository: Repository<SalaryHistory>,
    @InjectRepository(Employee)
    private employeeRepository: Repository<Employee>,
  ) {}

  // Salary CRUD Operations
  async createSalary(createSalaryDto: CreateSalaryDto): Promise<Salary> {
    const existingSalary = await this.salaryRepository.findOne({
      where: { employee: { employee_id: createSalaryDto.employee_id } },
    });
    if (existingSalary) {
      throw new ConflictException(
        `Salary already exists for Employee ID ${createSalaryDto.employee_id}`,
      );
    }

    const employee = await this.employeeRepository.findOne({
      where: { employee_id: createSalaryDto.employee_id },
    });
    if (!employee) {
      throw new NotFoundException(
        `Employee with ID ${createSalaryDto.employee_id} not found`,
      );
    }

    const salary = this.salaryRepository.create({
      ...createSalaryDto,
      employee,
    });
    return this.salaryRepository.save(salary);
  }




  async findAllSalaries(): Promise<Salary[]> {
    return this.salaryRepository.find({
      relations: ['employee'],
    });
  }





  async findOneSalary(id: number): Promise<Salary> {
    const salary = await this.salaryRepository.findOne({
      where: { employee_id: id },
      relations: ['employee'],
    });

    if (!salary) {
      throw new NotFoundException(`Salary with ID ${id} not found`);
    }
    return salary;
  }





  async updateSalary(id: number, updateSalaryDto: UpdateSalaryDto): Promise<Salary> {
    const salary = await this.findOneSalary(id);
    Object.assign(salary, updateSalaryDto);
    return this.salaryRepository.save(salary);
  }





  async deleteSalary(id: number): Promise<void> {
    const salary = await this.findOneSalary(id);
    await this.salaryRepository.remove(salary);
  }







  // SalaryHistory CRUD Operations
  async createSalaryHistory(createSalaryHistoryDto: CreateSalaryHistoryDto) {
    
    // Validate employee_id
    const employee = await this.salaryRepository.findOne({
      where: { employee_id: createSalaryHistoryDto.employee_id },
    });
    if (!employee) {
      throw new NotFoundException(
        `Employee with ID ${createSalaryHistoryDto.employee_id} not found`,
      );
    }

    // Validate recorded_by_employee_id
    const paidBy = await this.employeeRepository.findOne({
      where: { employee_id: createSalaryHistoryDto.paid_by_employee_id },
    });
    if (!paidBy) {
      throw new NotFoundException(
        `Employee with ID ${createSalaryHistoryDto.paid_by_employee_id} not found`,
      );
    }

    // Check for duplicate payment this month
    const currentMonthStart = new Date();
    currentMonthStart.setDate(1);
    currentMonthStart.setHours(0, 0, 0, 0);
    const currentMonthEnd = new Date(currentMonthStart);
    currentMonthEnd.setMonth(currentMonthEnd.getMonth() + 1);

    const existingHistory = await this.salaryHistoryRepository.findOne({
      where: {
        employee: { employee_id: createSalaryHistoryDto.employee_id },
        timestamp: Raw((alias) => `${alias} BETWEEN :start AND :end`, {
          start: currentMonthStart,
          end: currentMonthEnd,
        }),
      },
    });
    if (existingHistory) {
      throw new ConflictException(
        `Payment already recorded for Employee ID ${createSalaryHistoryDto.employee_id} this month`,
      );
    }

    const bonus = createSalaryHistoryDto.bonus || 0;
    const salaryId = employee.salary_id;
    const salary = employee.amount;
  
    const totalSalary = salary + (salary * bonus);


    const salaryHistory = this.salaryHistoryRepository.create({
      ...createSalaryHistoryDto,
      employee_id:employee.employee_id,
      recorded_by: paidBy,
      bonus: createSalaryHistoryDto.bonus || 0,
      totalSalary: totalSalary,
      salary_id: salaryId,
    });
    await this.salaryHistoryRepository.save(salaryHistory);
    return salaryHistory;
  }

  async findAllSalaryHistories(): Promise<SalaryHistory[]> {
    return this.salaryHistoryRepository.find({
      relations: ['employee', 'recorded_by', 'salary'],
    });
  }

  async findOneSalaryHistory(id: number): Promise<SalaryHistory> {
    const salaryHistory = await this.salaryHistoryRepository.findOne({
      where: { employee_id: id },
      relations: ['employee', 'recorded_by', 'salary'],
    });
    if (!salaryHistory) {
      throw new NotFoundException(`SalaryHistory with ID ${id} not found`);
    }
    return salaryHistory;
  }

  async updateSalaryHistory(
    id: number,
    updateSalaryHistoryDto: UpdateSalaryHistoryDto,
  ): Promise<SalaryHistory> {
    const salaryHistory = await this.findOneSalaryHistory(id);

    // Validate recorded_by_employee_id if provided
    if (updateSalaryHistoryDto.recorded_by_employee_id) {
      const paidBy = await this.employeeRepository.findOne({
        where: { employee_id: updateSalaryHistoryDto.recorded_by_employee_id },
      });
      if (!paidBy) {
        throw new NotFoundException(
          `Employee with ID ${updateSalaryHistoryDto.recorded_by_employee_id} not found`,
        );
      }
      salaryHistory.recorded_by = paidBy;
    }

    // Validate salary_id if provided
    if (updateSalaryHistoryDto.salary_id) {
      const salary = await this.salaryRepository.findOne({
        where: { salary_id: updateSalaryHistoryDto.salary_id },
      });
      if (!salary) {
        throw new NotFoundException(
          `Salary with ID ${updateSalaryHistoryDto.salary_id} not found`,
        );
      }
      salaryHistory.salary = salary;
    }

    // Update bonus and recalculate totalSalary if salary_id or bonus changes
    if (
      updateSalaryHistoryDto.bonus !== undefined ||
      updateSalaryHistoryDto.salary_id !== undefined
    ) {
      const linkedSalary = updateSalaryHistoryDto.salary_id
        ? await this.salaryRepository.findOne({
            where: { salary_id: updateSalaryHistoryDto.salary_id },
          })
        : salaryHistory.salary;
      const amount = linkedSalary ? linkedSalary.amount : 0;
      const bonus =
        updateSalaryHistoryDto.bonus !== undefined
          ? updateSalaryHistoryDto.bonus
          : salaryHistory.bonus;
      salaryHistory.totalSalary = amount + bonus;
    }

    Object.assign(salaryHistory, updateSalaryHistoryDto);
    return this.salaryHistoryRepository.save(salaryHistory);
  }

  async deleteSalaryHistory(id: number): Promise<void> {
    const salaryHistory = await this.findOneSalaryHistory(id);
    await this.salaryHistoryRepository.remove(salaryHistory);
  }
}
