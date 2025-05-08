import { Controller, Post, Body,Get,Delete, Param, ParseIntPipe } from '@nestjs/common';
import { ReservationService } from './reservation.service';
import { CreateReservationDto } from './dtos/reservation.dto';

@Controller('reservation')
export class ReservationController {
  constructor(private readonly reservationService: ReservationService) {}

  @Post('booking')
  async create(@Body() dto: CreateReservationDto) {
    return this.reservationService.create(dto);
  }

  //get all the reservations
    @Get('getAllReservations')
    async getAllReservations() {
        return this.reservationService.getAllReservations();
    }


    //delete my reservation in param use pipe
    @Delete('deleteReservation/:reservation_id')
    async deleteReservation(@Param('reservation_id',ParseIntPipe) reservation_id: number) {
        return this.reservationService.deleteReservation(reservation_id);
    }
    
    

    

}