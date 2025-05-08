import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Employee, EmployeeRole, EmployeeStatus } from './entities/employee.entity';
import { Management } from './entities/management.entity';
import { CreateEmployeeDto } from './dtos/create-employee.dto';
import { UpdateEmployeeDto } from './dtos/update-employee.dto';
import { UpdateManagementDto } from './dtos/update-management.dto';
import { SalaryService } from '../salary/salary.service';

@Injectable()
export class ManagementService {
  constructor(
    @InjectRepository(Employee)
    private employeeRepository: Repository<Employee>,
    @InjectRepository(Management)
    private managementRepository: Repository<Management>,
    private readonly salaryService: SalaryService
  ) {}

  // Employee CRUD Operations
  async createEmployee(createEmployeeDto: CreateEmployeeDto,): Promise<Employee> {
    const { salary, ...employeeData } = createEmployeeDto;

    const employee = this.employeeRepository.create(employeeData);
    const savedEmployee = await this.employeeRepository.save(employee);


    await this.salaryService.createSalary({
      employee_id: savedEmployee.employee_id,
      amount: salary,
    });

    // Automatically create Management record for specific roles
    const rolesRequiringManagement = [
      EmployeeRole.ADMIN,
      EmployeeRole.MANAGER,
      EmployeeRole.RECEPTIONIST,
      EmployeeRole.FLOOR_MANAGER,
      EmployeeRole.RESTAURANT_RECEPTIONIST,
    ];

    if (rolesRequiringManagement.includes(savedEmployee.role)) {
      const existingManagement = await this.managementRepository.findOne({
        where: { employee: { employee_id: savedEmployee.employee_id } },
      });
      if (existingManagement) {
        throw new ConflictException(
          `Management record already exists for Employee ID ${savedEmployee.employee_id}`,
        );
      }

      const management = this.managementRepository.create({
        email: `pending_${savedEmployee.employee_id}@example.com`,
        password: '',
        employee: savedEmployee,
      }); 
      await this.managementRepository.save(management);
    }

    return savedEmployee;
  }

  async findAllEmployees(): Promise<Employee[]> {
    return this.employeeRepository.find({ relations: ['management'] });
  }

  async findOneEmployee(id: number): Promise<Employee> {
    const employee = await this.employeeRepository.findOne({
      where: { employee_id: id },
      relations: ['management'],
    });
    if (!employee) {
      throw new NotFoundException(`Employee with ID ${id} not found`);
    }
    return employee;
  }

  async updateEmployee(
    id: number,
    updateEmployeeDto: UpdateEmployeeDto,
  ): Promise<Employee> {
    const employee = await this.findOneEmployee(id);
    const rolesRequiringManagement = [
      EmployeeRole.ADMIN,
      EmployeeRole.MANAGER,
      EmployeeRole.RECEPTIONIST,
      EmployeeRole.FLOOR_MANAGER,
      EmployeeRole.RESTAURANT_RECEPTIONIST,
    ];

    // If role is updated, manage Management record
    if (updateEmployeeDto.role) {
      const needsManagement = rolesRequiringManagement.includes(
        updateEmployeeDto.role,
      );
      const existingManagement = await this.managementRepository.findOne({
        where: { employee: { employee_id: id } },
      });

      if (needsManagement && !existingManagement) {
        // Create Management record if new role requires it
        const management = this.managementRepository.create({
          email: `pending_${id}@example.com`,
          password: '',
          employee,
        });
        await this.managementRepository.save(management);
      } else if (!needsManagement && existingManagement) {
        // Remove Management record if new role doesn't require it
        await this.managementRepository.remove(existingManagement);
      }
    }

    Object.assign(employee, updateEmployeeDto);
    return this.employeeRepository.save(employee);
  }

  async deleteEmployee(id: number): Promise<void> {
    const employee = await this.findOneEmployee(id);
    await this.salaryService.deleteSalary(id);
    await this.employeeRepository.remove(employee);
  }

  //view employee by phone
  async findEmployeeByPhone(phone: string): Promise<Employee[]> {
    return this.employeeRepository.find({where: { phone },relations: ['management'],});
  }

  //view employee by name
  async findEmployeeByName(name: string): Promise<Employee[]> {
    return this.employeeRepository.find({where: { name },relations: ['management'],});
  }

  //view employee by role
  async findEmployeeByRole(role: EmployeeRole): Promise<Employee[]> {
    return this.employeeRepository.find({where: { role },relations: ['management'],});
  }

  //view employee by status
  async findEmployeeByStatus(status: EmployeeStatus): Promise<Employee[]> {
    return this.employeeRepository.find({where: { status },relations: ['management'],});
  }




  // Management CRUD Operations (no createManagement)
  async findAllManagement(): Promise<Management[]> {
    return this.managementRepository.find({ relations: ['employee'] });
  }

  async findOneManagement(id: number): Promise<Management> {
    const management = await this.managementRepository.findOne({
      where: { management_id: id },
      relations: ['employee'],
    });
    if (!management) {
      throw new NotFoundException(`Management with ID ${id} not found`);
    }
    return management;
  }

  async updateManagement(
    id: number,
    updateManagementDto: UpdateManagementDto,
  ): Promise<Management> {
    const management = await this.findOneManagement(id);
    Object.assign(management, updateManagementDto);
    return this.managementRepository.save(management);
  }

  async deleteManagement(id: number): Promise<void> {
    const management = await this.findOneManagement(id);
    await this.managementRepository.remove(management);
  }
}
