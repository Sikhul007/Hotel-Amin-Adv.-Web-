import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfirmationService } from './confirmation.service';
import { ConfirmationController } from './confirmation.controller';
import { Reservation } from '../reservation/entities/reservation.entity';
import { User } from '../user/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Reservation, User])],
  providers: [ConfirmationService],
  controllers: [ConfirmationController],
  exports: [ConfirmationService],
})
export class ConfirmationModule {}