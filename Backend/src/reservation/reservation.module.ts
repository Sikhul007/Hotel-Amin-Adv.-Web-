import { Module, forwardRef } from '@nestjs/common';
import { ReservationController } from './reservation.controller';
import { ReservationService } from './reservation.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reservation } from './entities/reservation.entity';
import { UserModule } from '../user/user.module';
import { RoomModule } from '../room/room.module';
import { BookingModule } from '../booking/booking.module';
import { ConfirmationModule } from 'src/confirmation/confirmation.module';

 
@Module({
  imports: [TypeOrmModule.forFeature([Reservation]),
  UserModule,
  RoomModule,
  ConfirmationModule,
  forwardRef(() => BookingModule),],
  controllers: [ReservationController],
  providers: [ReservationService],
  exports: [ReservationService,TypeOrmModule],
  
})
export class ReservationModule {}
