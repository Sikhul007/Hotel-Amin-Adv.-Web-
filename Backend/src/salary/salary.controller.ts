import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  
} from '@nestjs/common';
import { SalaryService } from './salary.service';
import { CreateSalaryDto } from './dtos/create-salary.dto';
import { UpdateSalaryDto } from './dtos/update-salary.dto';
import { CreateSalaryHistoryDto } from './dtos/create-salary-history.dto';
import { UpdateSalaryHistoryDto } from './dtos/update-salary-history.dto';

@Controller('salary')
export class SalaryController {
  constructor(private readonly salaryService: SalaryService) {}

  @Post('createSalaries')
  createSalary(@Body() createSalaryDto: CreateSalaryDto) {
    return this.salaryService.createSalary(createSalaryDto);
  }

  @Get('findAllSalaries')
  findAllSalaries() {
    return this.salaryService.findAllSalaries();
  }

  @Get('findSalaryById/:id')
  findOneSalary(@Param('id') id: number) {
    return this.salaryService.findOneSalary(id);
  }

  @Put('updateSalaryById/:id')
  updateSalary(@Param('id') id: number,@Body() updateSalaryDto: UpdateSalaryDto,) {
    return this.salaryService.updateSalary(id, updateSalaryDto);
  }

  @Delete('deleteSalaryById/:id')
  deleteSalary(@Param('id') id: number) {
    return this.salaryService.deleteSalary(id);
  }

  @Post('createSalaryHistories')
  createSalaryHistory(@Body() createSalaryHistoryDto: CreateSalaryHistoryDto) {
    return this.salaryService.createSalaryHistory(createSalaryHistoryDto);
  } 

  @Get('findAllSalaryHistories')
  findAllSalaryHistories() {
    return this.salaryService.findAllSalaryHistories();
  }

  @Get('findSalaryHistoryById/:id')
  findOneSalaryHistory(@Param('id') id: number) {
    return this.salaryService.findOneSalaryHistory(id);
  }

  @Put('updateSalaryHistoryById/:id')
  updateSalaryHistory(
    @Param('id') id: number,
    @Body() updateSalaryHistoryDto: UpdateSalaryHistoryDto,
  ) {
    return this.salaryService.updateSalaryHistory(id, updateSalaryHistoryDto);
  }

  @Delete('deleteSalaryHistoryById/:id')
  deleteSalaryHistory(@Param('id') id: number) {
    return this.salaryService.deleteSalaryHistory(id);
  }
}
