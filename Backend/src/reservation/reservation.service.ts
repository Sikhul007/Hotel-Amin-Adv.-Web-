import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Reservation } from './entities/reservation.entity';
import { Rooms } from '../room/entities/room.entity';
import { Booking } from '../booking/entities/booking.entity';
import { User } from '../user/entities/user.entity';
import { CreateReservationDto } from './dtos/reservation.dto';
import { ConfirmationService } from '../confirmation/confirmation.service';

@Injectable()
export class ReservationService {
  constructor(
    @InjectRepository(Reservation) private reservationRepository: Repository<Reservation>,
    @InjectRepository(Rooms) private roomsRepository: Repository<Rooms>,
    @InjectRepository(Booking) private bookingRepository: Repository<Booking>,
    @InjectRepository(User) private userRepository: Repository<User>,
    private confirmationService: ConfirmationService,
  ) {}

  async create(dto: CreateReservationDto){
    // Validate user
    const user = await this.userRepository.findOneBy({ user_id: dto.user_id });
    if (!user) {
      return { message: 'User not found' };
    }

    // Validate dates
    const checkinDate = new Date(dto.checkin_date); 
    const checkoutDate = new Date(dto.checkout_date);
    if (checkinDate >= checkoutDate) {
      return { message: 'Check-in date must be before check-out date' };
    }

    // Validate rooms (check existence only)
    const rooms = await this.roomsRepository.find({
      where: { room_num: In(dto.room_num) },
    });
    if (rooms.length !== dto.room_num.length) {
      return { message: 'One or more rooms do not exist' };
    }

    // Check for conflicts in Reservation table
    const conflictingReservations = await this.reservationRepository
      .createQueryBuilder('reservation')
      .where('reservation.room_num && :roomNums', { roomNums: dto.room_num })
      .andWhere(
        '(:checkin <= reservation.checkout_date AND :checkout >= reservation.checkin_date)',
        { checkin: checkinDate, checkout: checkoutDate },
      )
      .andWhere(
        'NOT (reservation.checkout_date = :checkin)',
        { checkin: checkinDate },
      )
      .getMany();

    // Collect conflicting room numbers from reservations
    const conflictingReservationRooms = new Set<number>();
    conflictingReservations.forEach(reservation => {
      reservation.room_num.forEach(roomNum => {
        if (dto.room_num.includes(roomNum)) {
          conflictingReservationRooms.add(roomNum);
        }
      });
    });

    // Check for conflicts in Booking table
    const conflictingBookings = await this.bookingRepository
      .createQueryBuilder('booking')
      .where('booking.room_num && :roomNums', { roomNums: dto.room_num })
      .andWhere(
        '(:checkin <= booking.checkout_date AND :checkout >= booking.checkin_date)',
        { checkin: checkinDate, checkout: checkoutDate },
      )
      .andWhere(
        'NOT (booking.checkout_date = :checkin)',
        { checkin: checkinDate },
      )
      .getMany();

    // Collect conflicting room numbers from bookings
    const conflictingBookingRooms = new Set<number>();
    conflictingBookings.forEach(booking => {
      booking.room_num.forEach(roomNum => {
        if (dto.room_num.includes(roomNum)) {
          conflictingBookingRooms.add(roomNum);
        }
      });
    });

    // Combine conflicting rooms
    const allConflictingRooms = [...new Set([...conflictingReservationRooms, ...conflictingBookingRooms])];
    if (allConflictingRooms.length > 0) {
      return {
        message: `Rooms ${allConflictingRooms.join(', ')} are not available for the selected dates`,
      };
    }

    // Calculate total price with discount
    const nights = Math.floor((checkoutDate.getTime() - checkinDate.getTime()) / (1000 * 60 * 60 * 24));
    const totalPrice = rooms.reduce((sum, room) => {
      const adjustedPrice = Number(room.room_price) * (1 - Number(room.discount) / 100);
      const roomPrice = adjustedPrice * nights;
      return sum + roomPrice;
    }, 0);

    // Create reservation
    const reservation = this.reservationRepository.create({
      checkin_date: checkinDate,
      checkout_date: checkoutDate,
      number_of_guests: dto.number_of_guests,
      room_num: dto.room_num,
      total_price: totalPrice,
      typeOfBooking: 'website',
      user_id: dto.user_id,
      user,
    });

    const savedReservation = await this.reservationRepository.save(reservation);

    await this.confirmationService.sendReservationConfirmation(savedReservation);

    return {
      reservation_id: savedReservation.reservation_id,
      checkin_date: savedReservation.checkin_date,
      checkout_date: savedReservation.checkout_date,
      number_of_guests: savedReservation.number_of_guests,
      room_num: savedReservation.room_num,
      total_price: savedReservation.total_price,
      booking_date: savedReservation.booking_date,
      typeOfBooking: savedReservation.typeOfBooking,
      user_id: savedReservation.user_id,
    };
  }





    async getAllReservations(){
        return this.reservationRepository.find();
    }

    
    async deleteReservation(reservation_id: number){
        const reservation = await this.reservationRepository.findOneBy({ reservation_id });
        if (!reservation) {
            return { message: 'Reservation not found' };
        }
        await this.reservationRepository.delete(reservation_id);
        return { message: 'Reservation deleted successfully' };
    }
}