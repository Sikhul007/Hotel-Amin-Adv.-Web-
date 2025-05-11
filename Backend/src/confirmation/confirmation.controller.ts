import { Controller, Post, Param, ParseIntPipe } from '@nestjs/common';
import { ConfirmationService } from './confirmation.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reservation } from '../reservation/entities/reservation.entity';

@Controller('confirmation')
export class ConfirmationController {
  constructor(
    private readonly confirmationService: ConfirmationService,
    @InjectRepository(Reservation)
    private reservationRepository: Repository<Reservation>,
  ) {}

  @Post('send/:reservationId')
  async sendConfirmation(@Param('reservationId', ParseIntPipe) reservationId: number): Promise<string> {
    const reservation = await this.reservationRepository.findOne({ where: { reservation_id: reservationId } });
    if (!reservation) {
      throw new Error(`Reservation with ID ${reservationId} not found`);
    }
    await this.confirmationService.sendReservationConfirmation(reservation);
    return `Confirmation email sent for reservation ID ${reservationId}`;
  }
}