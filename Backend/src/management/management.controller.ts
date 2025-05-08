import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  
} from '@nestjs/common';
import { ManagementService } from './management.service';
import { CreateEmployeeDto } from './dtos/create-employee.dto';
import { UpdateEmployeeDto } from './dtos/update-employee.dto';
import { UpdateManagementDto } from './dtos/update-management.dto';
import { Employee, EmployeeRole, EmployeeStatus } from './entities/employee.entity';
import { Management } from './entities/management.entity';

@Controller('management')
export class ManagementController {
  constructor(private readonly managementService: ManagementService) {}

  // Employee Endpoints
  @Post('createEmployees')
  createEmployee(
    @Body() createEmployeeDto: CreateEmployeeDto,
  ): Promise<Employee> {
    return this.managementService.createEmployee(createEmployeeDto);
  }

  @Get('viewAllEmployees')
  findAllEmployees(): Promise<Employee[]> {
    return this.managementService.findAllEmployees();
  }

  @Get('viewEmployeeById/:id')
  findOneEmployee(@Param('id', ParseIntPipe) id: number): Promise<Employee> {
    return this.managementService.findOneEmployee(id);
  }

  @Put('updateEmployeeById/:id')
  updateEmployee(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEmployeeDto: UpdateEmployeeDto,
  ): Promise<Employee> {
    return this.managementService.updateEmployee(id, updateEmployeeDto);
  }

  @Delete('deleteEmployeeById/:id')
  deleteEmployee(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.managementService.deleteEmployee(id);
  }


  //view employee by name
  @Get('viewEmployeeByName/:name')
  findEmployeeByName(@Param('name') name: string): Promise<Employee[]> {
    return this.managementService.findEmployeeByName(name);
  }

  //view employee by phone
  @Get('viewEmployeeByPhone/:phone')
  findEmployeeByPhone(@Param('phone') phone: string): Promise<Employee[]> {
    return this.managementService.findEmployeeByPhone(phone);
  }

  //view employee by role
  @Get('viewEmployeeByRole/:role')
  findEmployeeByRole(@Param('role') role: EmployeeRole): Promise<Employee[]> {
    return this.managementService.findEmployeeByRole(role);
  }

  //view employee by status
  @Get('viewEmployeeByStatus/:status')
  findEmployeeByStatus(@Param('status') status: EmployeeStatus): Promise<Employee[]> {
    return this.managementService.findEmployeeByStatus(status);
  }









  // Management Endpoints
  @Get('viewAllManagements')
  findAllManagement(): Promise<Management[]> {
    return this.managementService.findAllManagement();
  }

  @Get('management/:id')
  findOneManagement(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Management> {
    return this.managementService.findOneManagement(id);
  }

  @Put('updateManagementById/:id')
  updateManagement(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateManagementDto: UpdateManagementDto,
  ): Promise<Management> {
    return this.managementService.updateManagement(id, updateManagementDto);
  }

  @Delete('deleteManagementById/:id')
  deleteManagement(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.managementService.deleteManagement(id);
  }
}
