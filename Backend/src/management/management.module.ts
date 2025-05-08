import { Module, forwardRef } from '@nestjs/common';
import { ManagementController } from './management.controller';
import { ManagementService } from './management.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Employee } from './entities/employee.entity';
import { Management } from './entities/management.entity';
import { SalaryModule } from '../salary/salary.module';

@Module({
  imports: [TypeOrmModule.forFeature([Employee, Management]),forwardRef(() => SalaryModule)],
  controllers: [ManagementController],
  providers: [ManagementService],
  exports: [ManagementService,TypeOrmModule],
})
export class ManagementModule {}
