import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Not } from 'typeorm';
import { Booking, PaymentStatus, TypeOfBooking } from './entities/booking.entity';
import { Accounts, PaymentType } from './entities/accounts.entity';
import { BookingHistory } from './entities/booking-history.entity';
import { Customer } from './entities/customer.entity';
import { HousekeepingStatus, Rooms, RoomStatus } from '../room/entities/room.entity';
import { Coupon } from '../coupon/entities/coupon.entity';
import { CouponUsage } from '../coupon/entities/coupon-usage.entity';
import { Reservation } from '../reservation/entities/reservation.entity';
import { Employee } from '../management/entities/employee.entity';
import { CreateInPersonBookingDto, CreateCheckinWithReservationDto, UpdateBookingDto, CreateAccountDto, CheckoutDto, SearchByPaymentStatusDto, SearchByTypeOfBookingDto, SearchByCouponCodeDto, RoomServiceDto } from './dtos/booking.dto';

@Injectable()
export class BookingService {
  constructor(
    @InjectRepository(Booking) private bookingRepository: Repository<Booking>,
    @InjectRepository(Accounts) private accountsRepository: Repository<Accounts>,
    @InjectRepository(BookingHistory) private bookingHistoryRepository: Repository<BookingHistory>,
    @InjectRepository(Customer) private customerRepository: Repository<Customer>,
    @InjectRepository(Rooms) private roomsRepository: Repository<Rooms>,
    @InjectRepository(Coupon) private couponRepository: Repository<Coupon>,
    @InjectRepository(CouponUsage) private couponUsageRepository: Repository<CouponUsage>,
    @InjectRepository(Reservation) private reservationRepository: Repository<Reservation>,
    @InjectRepository(Employee) private employeeRepository: Repository<Employee>,
  ) {}

  // In-person booking
  async createInPersonBooking(dto: CreateInPersonBookingDto) {
    try {
      // Validate employee
      const employee = await this.employeeRepository.findOneBy({ employee_id: dto.employee_id });
      if (!employee) {
        throw new BadRequestException(`Employee with ID ${dto.employee_id} not found`);
      }

      // Validate dates
      const checkinDate = new Date(dto.checkin_date);
      const checkoutDate = new Date(dto.checkout_date);
      if (checkinDate >= checkoutDate) {
        throw new BadRequestException('Check-in date must be before check-out date');
      }

      // Validate rooms
      const rooms = await this.roomsRepository.find({
        where: { room_num: In(dto.room_num), room_status: Not(RoomStatus.MAINTENANCE) },
      });
      if (rooms.length !== dto.room_num.length) {
        throw new BadRequestException('One or more rooms do not exist or are in maintenance');
      }

      // Check for conflicts in Reservation table
      const conflictingReservations = await this.reservationRepository
        .createQueryBuilder('reservation')
        .where('reservation.room_num && :roomNums', { roomNums: dto.room_num })
        .andWhere(
          '(:checkin <= reservation.checkout_date AND :checkout >= reservation.checkin_date)',
          { checkin: checkinDate, checkout: checkoutDate },
        )
        .andWhere('NOT (reservation.checkout_date = :checkin)', { checkin: checkinDate })
        .getMany();

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
        .andWhere('NOT (booking.checkout_date = :checkin)', { checkin: checkinDate })
        .getMany();

      const conflictingBookingRooms = new Set<number>();
      conflictingBookings.forEach(booking => {
        booking.room_num.forEach(roomNum => {
          if (dto.room_num.includes(roomNum)) {
            conflictingBookingRooms.add(roomNum);
          }
        });
      });

      const allConflictingRooms = [...new Set([...conflictingReservationRooms, ...conflictingBookingRooms])];
      if (allConflictingRooms.length > 0) {
        throw new BadRequestException(`Rooms ${allConflictingRooms.join(', ')} are not available for the selected dates`);
      }

      // Save customer
      let customer = await this.customerRepository.findOneBy({ nid: dto.nid });
      if (!customer) {
        customer = this.customerRepository.create({
          name: dto.name,
          email: dto.email,
          phone: dto.phone,
          address: dto.address,
          nid: dto.nid,
          nationality: dto.nationality,
          Profession: dto.Profession,
          age: dto.age,
        });
        try {
          customer = await this.customerRepository.save(customer);
        } catch (error) {
          if (error.code === '23505') { // PostgreSQL unique constraint violation
            throw new BadRequestException(`Customer with NID ${dto.nid} already exists`);
          }
          throw new InternalServerErrorException(`Failed to save customer: ${error.message}`);
        }
      }

      // Validate customer
      if (!customer || !customer.customer_id) {
        throw new InternalServerErrorException('Failed to create or retrieve customer with valid ID');
      }

      // Calculate room price
      const nights = Math.floor((checkoutDate.getTime() - checkinDate.getTime()) / (1000 * 60 * 60 * 24));
      const roomPrice = rooms.reduce((sum, room) => {
        const adjustedPrice = Number(room.room_price) * (1 - Number(room.discount) / 100);
        return sum + adjustedPrice * nights;
      }, 0);

      // Handle coupon
      let coupon: Coupon | undefined = undefined;
      let couponPercent = 0;
      if (dto.coupon_code) {
        const foundCoupon = await this.couponRepository.findOneBy({ coupon_code: dto.coupon_code, is_active: true });
        if (!foundCoupon) {
          throw new BadRequestException('Invalid or inactive coupon code');
        }
        coupon = foundCoupon;
        couponPercent = Number(coupon.coupon_percent);
      }

      // Calculate total price
      const totalPrice = roomPrice * (1 - couponPercent / 100);

      // Create booking with explicit customer_id
      const booking = this.bookingRepository.create({
        customer_id: customer.customer_id, // Explicitly set customer_id
        customer, // Include relation for TypeORM
        checkin_date: checkinDate,
        checkout_date: checkoutDate,
        room_num: dto.room_num,
        number_of_guests: dto.number_of_guests,
        room_price: roomPrice,
        coupon,
        coupon_percent: couponPercent,
        total_price: totalPrice,
        payment_status: PaymentStatus.PENDING,
        booking_date: new Date(),
        typeOfBooking: TypeOfBooking.SELF,
        service_asked: false,
        is_checkedout: false,
        employee: { employee_id: dto.employee_id },
      });

      let savedBooking: Booking;
      try {
        savedBooking = await this.bookingRepository.save(booking);
      } catch (error) {
        throw new InternalServerErrorException(`Failed to save booking: ${error.message}`);
      }

      await this.roomsRepository.update(
        { room_num: In(savedBooking.room_num) },
        { room_status: RoomStatus.OCCUPIED }
      );

      // Log coupon usage
      if (coupon) {
        const couponUsage = this.couponUsageRepository.create({
          coupon,
          booking: savedBooking,
          used_by: { employee_id: dto.employee_id },
          used_at: new Date(),
        });
        try {
          await this.couponUsageRepository.save(couponUsage);
        } catch (error) {
          throw new InternalServerErrorException(`Failed to save coupon usage: ${error.message}`);
        }
      }

      

      return {
        booking_id: savedBooking.booking_id,
        customer_id: savedBooking.customer_id,
        checkin_date: savedBooking.checkin_date,
        checkout_date: savedBooking.checkout_date,
        room_num: savedBooking.room_num,
        number_of_guests: savedBooking.number_of_guests,
        room_price: savedBooking.room_price,
        coupon_code: coupon?.coupon_code,
        total_price: savedBooking.total_price,
        payment_status: savedBooking.payment_status,
        booking_date: savedBooking.booking_date,
        typeOfBooking: savedBooking.typeOfBooking,
        service_asked: savedBooking.service_asked,
        is_checkedout: savedBooking.is_checkedout,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(`Failed to create booking: ${error.message}`);
    }
  }

  // Check-in with reservation
  async checkinWithReservation(dto: CreateCheckinWithReservationDto) {
    try {
      // Validate employee
      const employee = await this.employeeRepository.findOneBy({ employee_id: dto.employee_id });
      if (!employee) {
        throw new BadRequestException(`Employee with ID ${dto.employee_id} not found`);
      }

      // Fetch reservation
      const reservation = await this.reservationRepository.findOne({
        where: { reservation_id: dto.reservation_id },
        relations: ['user'],
      });
      if (!reservation) {
        throw new BadRequestException('Reservation not found');
      }

      // Validate rooms
      const rooms = await this.roomsRepository.find({
        where: { room_num: In(reservation.room_num), room_status: Not(RoomStatus.MAINTENANCE) },
      });
      if (rooms.length !== reservation.room_num.length) {
        throw new BadRequestException('One or more rooms do not exist or are in maintenance');
      }

      // Check conflicts
      const checkinDate = new Date(reservation.checkin_date);
      const checkoutDate = new Date(reservation.checkout_date);
      const conflictingReservations = await this.reservationRepository
        .createQueryBuilder('reservation')
        .where('reservation.room_num && :roomNums', { roomNums: reservation.room_num })
        .andWhere('reservation.reservation_id != :resId', { resId: reservation.reservation_id })
        .andWhere(
          '(:checkin <= reservation.checkout_date AND :checkout >= reservation.checkin_date)',
          { checkin: checkinDate, checkout: checkoutDate },
        )
        .andWhere('NOT (reservation.checkout_date = :checkin)', { checkin: checkinDate })
        .getMany();

      const conflictingReservationRooms = new Set<number>();
      conflictingReservations.forEach(res => {
        res.room_num.forEach(roomNum => {
          if (reservation.room_num.includes(roomNum)) {
            conflictingReservationRooms.add(roomNum);
          }
        });
      });

      const conflictingBookings = await this.bookingRepository
        .createQueryBuilder('booking')
        .where('booking.room_num && :roomNums', { roomNums: reservation.room_num })
        .andWhere(
          '(:checkin <= booking.checkout_date AND :checkout >= booking.checkin_date)',
          { checkin: checkinDate, checkout: checkoutDate },
        )
        .andWhere('NOT (booking.checkout_date = :checkin)', { checkin: checkinDate })
        .getMany();

      const conflictingBookingRooms = new Set<number>();
      conflictingBookings.forEach(booking => {
        booking.room_num.forEach(roomNum => {
          if (reservation.room_num.includes(roomNum)) {
            conflictingBookingRooms.add(roomNum);
          }
        });
      });

      const allConflictingRooms = [...new Set([...conflictingReservationRooms, ...conflictingBookingRooms])];
      if (allConflictingRooms.length > 0) {
        throw new BadRequestException(`Rooms ${allConflictingRooms.join(', ')} are not available for the selected dates`);
      }

      // Find or create customer
      let customer = await this.customerRepository.findOneBy({ nid: reservation.user.nid || 'Unknown' });
      if (!customer) {
        customer = this.customerRepository.create({
          name: reservation.user.name || 'Unknown',
          email: reservation.user.email || 'unknown@example.com',
          phone: reservation.user.phone || 'Unknown',
          nid: reservation.user.nid || 'Unknown',
          nationality: reservation.user.nationality || 'Unknown',
          Profession: reservation.user.Profession || 'Unknown',
          age: reservation.user.age || 30, // Default
        });
        try {
          customer = await this.customerRepository.save(customer);
        } catch (error) {
          if (error.code === '23505') { // PostgreSQL unique constraint violation
            throw new BadRequestException(`Customer with NID ${reservation.user.nid || 'Unknown'} already exists`);
          }
          throw new InternalServerErrorException(`Failed to save customer: ${error.message}`);
        }
      }

      // Validate customer
      if (!customer || !customer.customer_id) {
        throw new InternalServerErrorException('Failed to create or retrieve customer with valid ID');
      }

      // Handle coupon
      let coupon: Coupon | undefined = undefined;
      let couponPercent = 0;
      if (dto.coupon_code) {
        const foundCoupon = await this.couponRepository.findOneBy({ coupon_code: dto.coupon_code, is_active: true });
        if (!foundCoupon) {
          throw new BadRequestException('Invalid or inactive coupon code');
        }
        coupon = foundCoupon;
        couponPercent = Number(coupon.coupon_percent);
      }

      // Calculate total price
      const roomPrice = Number(reservation.total_price); // From reservation
      const totalPrice = roomPrice * (1 - couponPercent / 100);

      // Create booking with explicit customer_id
      const booking = this.bookingRepository.create({
        customer_id: customer.customer_id, // Explicitly set customer_id
        customer, // Include relation for TypeORM
        checkin_date: checkinDate,
        checkout_date: checkoutDate,
        room_num: reservation.room_num,
        number_of_guests: reservation.number_of_guests,
        room_price: roomPrice,
        coupon,
        coupon_percent: couponPercent,
        total_price: totalPrice,
        payment_status: PaymentStatus.PENDING,
        booking_date: reservation.booking_date, // Use reservation booking_date
        typeOfBooking: TypeOfBooking.WEBSITE, // Set to WEBSITE for reservations
        service_asked: false,
        is_checkedout: false,
        employee: { employee_id: dto.employee_id },
      });

      let savedBooking: Booking;
      try {
        savedBooking = await this.bookingRepository.save(booking);
      } catch (error) {
        throw new InternalServerErrorException(`Failed to save booking: ${error.message}`);
      }

      await this.roomsRepository.update(
        { room_num: In(savedBooking.room_num) },
        { room_status: RoomStatus.OCCUPIED }
      );

      // Log coupon usage
      if (coupon) {
        const couponUsage = this.couponUsageRepository.create({
          coupon,
          booking: savedBooking,
          used_by: { employee_id: dto.employee_id },
          used_at: new Date(),
        });
        try {
          await this.couponUsageRepository.save(couponUsage);
        } catch (error) {
          throw new InternalServerErrorException(`Failed to save coupon usage: ${error.message}`);
        }
      }

      // Delete reservation
      try {
        await this.reservationRepository.delete(reservation.reservation_id);
      } catch (error) {
        throw new InternalServerErrorException(`Failed to delete reservation: ${error.message}`);
      }

      return {
        booking_id: savedBooking.booking_id,
        customer_id: savedBooking.customer_id,
        checkin_date: savedBooking.checkin_date,
        checkout_date: savedBooking.checkout_date,
        room_num: savedBooking.room_num,
        number_of_guests: savedBooking.number_of_guests,
        room_price: savedBooking.room_price,
        coupon_code: coupon?.coupon_code,
        total_price: savedBooking.total_price,
        payment_status: savedBooking.payment_status,
        booking_date: savedBooking.booking_date,
        typeOfBooking: savedBooking.typeOfBooking,
        service_asked: savedBooking.service_asked,
        is_checkedout: savedBooking.is_checkedout,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(`Failed to check-in with reservation: ${error.message}`);
    }
  }

  // Update booking
  async updateBooking(booking_id: number, dto: UpdateBookingDto) {
    try {
      const booking = await this.bookingRepository.findOne({
        where: { booking_id },
        relations: ['customer', 'coupon'],
      });
      if (!booking) {
        return { message: 'Booking not found' };
      }

      // Prepare updated fields
      const updatedFields: Partial<Booking> = {};

      // Validate checkout_date
      if (dto.checkout_date) {
        const newCheckoutDate = new Date(dto.checkout_date);
        if (newCheckoutDate <= new Date(booking.checkin_date)) {
          throw new BadRequestException('Check-out date must be after check-in date');
        }
        updatedFields.checkout_date = newCheckoutDate;
      }

      // Validate room_num
      let rooms: Rooms[] = [];
      if (dto.room_num) {
        rooms = await this.roomsRepository.find({
          where: { room_num: In(dto.room_num), room_status: Not(RoomStatus.MAINTENANCE) },
        });
        if (rooms.length !== dto.room_num.length) {
          throw new BadRequestException('One or more rooms do not exist or are in maintenance');
        }

        // Check conflicts
        const checkinDate = new Date(booking.checkin_date);
        const checkoutDate = dto.checkout_date ? new Date(dto.checkout_date) : new Date(booking.checkout_date);
        const roomNums = dto.room_num; // Local variable to satisfy TypeScript
        const conflictingReservations = await this.reservationRepository
          .createQueryBuilder('reservation')
          .where('reservation.room_num && :roomNums', { roomNums })
          .andWhere(
            '(:checkin <= reservation.checkout_date AND :checkout >= reservation.checkin_date)',
            { checkin: checkinDate, checkout: checkoutDate },
          )
          .andWhere('NOT (reservation.checkout_date = :checkin)', { checkin: checkinDate })
          .getMany();

        const conflictingReservationRooms = new Set<number>();
        conflictingReservations.forEach(res => {
          res.room_num.forEach(roomNum => {
            if (roomNums.includes(roomNum)) {
              conflictingReservationRooms.add(roomNum);
            }
          });
        });

        const conflictingBookings = await this.bookingRepository
          .createQueryBuilder('booking')
          .where('booking.room_num && :roomNums', { roomNums })
          .andWhere('booking.booking_id != :bookingId', { bookingId: booking_id })
          .andWhere(
            '(:checkin <= booking.checkout_date AND :checkout >= booking.checkin_date)',
            { checkin: checkinDate, checkout: checkoutDate },
          )
          .andWhere('NOT (booking.checkout_date = :checkin)', { checkin: checkinDate })
          .getMany();

        const conflictingBookingRooms = new Set<number>();
        conflictingBookings.forEach(b => {
          b.room_num.forEach(roomNum => {
            if (roomNums.includes(roomNum)) {
              conflictingBookingRooms.add(roomNum);
            }
          });
        });

        const allConflictingRooms = [...new Set([...conflictingReservationRooms, ...conflictingBookingRooms])];
        if (allConflictingRooms.length > 0) {
          throw new BadRequestException(`Rooms ${allConflictingRooms.join(', ')} are not available for the selected dates`);
        }
        updatedFields.room_num = dto.room_num;
      }

      // Handle coupon
      let coupon: Coupon | undefined = booking.coupon || undefined;
      let couponPercent = booking.coupon_percent || 0;
      if (dto.coupon_code !== undefined) {
        const foundCoupon = dto.coupon_code
          ? await this.couponRepository.findOneBy({ coupon_code: dto.coupon_code, is_active: true })
          : null;
        coupon = foundCoupon || undefined;
        if (dto.coupon_code && !coupon) {
          throw new BadRequestException('Invalid or inactive coupon code');
        }
        couponPercent = coupon ? Number(coupon.coupon_percent) : 0;
        updatedFields.coupon = coupon;
        updatedFields.coupon_percent = couponPercent;
      }

      // Update simple fields
      if (dto.is_checkedout !== undefined) updatedFields.is_checkedout = dto.is_checkedout;
      if (dto.service_asked !== undefined) updatedFields.service_asked = dto.service_asked;

      // Recalculate price if rooms or checkout_date changed
      if (dto.room_num || dto.checkout_date || dto.coupon_code !== undefined) {
        let roomPrice = booking.room_price;
        if (dto.room_num) {
          const nights = Math.floor(
            ((dto.checkout_date ? new Date(dto.checkout_date) : new Date(booking.checkout_date)).getTime() -
              new Date(booking.checkin_date).getTime()) /
              (1000 * 60 * 60 * 24)
          );
          roomPrice = rooms.reduce((sum, room) => {
            const adjustedPrice = Number(room.room_price) * (1 - Number(room.discount) / 100);
            return sum + adjustedPrice * nights;
          }, 0);
        }
        updatedFields.room_price = roomPrice;
        updatedFields.total_price = roomPrice * (1 - couponPercent / 100);
      }

      // Update booking
      try {
        await this.bookingRepository.update(booking_id, updatedFields);
      } catch (error) {
        throw new InternalServerErrorException(`Failed to update booking: ${error.message}`);
      }

      // Log coupon usage
      if (dto.coupon_code && coupon) {
        const couponUsage = this.couponUsageRepository.create({
          coupon,
          booking,
          used_by: { employee_id: 1 }, // Default for updates
          used_at: new Date(),
        });
        try {
          await this.couponUsageRepository.save(couponUsage);
        } catch (error) {
          throw new InternalServerErrorException(`Failed to save coupon usage: ${error.message}`);
        }
      }

      const updatedBooking = await this.bookingRepository.findOne({
        where: { booking_id },
        relations: ['customer', 'coupon'],
      });
      if (!updatedBooking) {
        throw new InternalServerErrorException('Failed to retrieve updated booking');
      }

      //if service_asked is true then update the rooms tables housekeepingstatus to needs_service, even the booking has multiple rooms
      if (dto.service_asked) {
        try {
          await this.roomsRepository.update(
            { room_num: In(updatedBooking.room_num) },
            { housekeeping_status: HousekeepingStatus.NEEDS_SERVICE }
          );
        } catch (error) {
          throw new InternalServerErrorException(`Failed to update room status: ${error.message}`);
        }
      }

      

      return {  
        booking_id: updatedBooking.booking_id,
        customer_id: updatedBooking.customer_id,
        checkin_date: updatedBooking.checkin_date,
        checkout_date: updatedBooking.checkout_date,
        room_num: updatedBooking.room_num,
        number_of_guests: updatedBooking.number_of_guests,
        room_price: updatedBooking.room_price,
        coupon_code: updatedBooking.coupon?.coupon_code,
        total_price: updatedBooking.total_price,
        payment_status: updatedBooking.payment_status,
        booking_date: updatedBooking.booking_date,
        typeOfBooking: updatedBooking.typeOfBooking,
        service_asked: updatedBooking.service_asked,
        is_checkedout: updatedBooking.is_checkedout,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(`Failed to update booking: ${error.message}`);
    }
  }

  // Create account (payment)
  async createAccount(booking_id: number, dto: CreateAccountDto) {
    try {
      const booking = await this.bookingRepository.findOneBy({ booking_id });
      if (!booking) {
        return { message: 'Booking not found' };
      }

      //if booking status is paid then return error
      if (booking.payment_status === PaymentStatus.PAID) {
        throw new BadRequestException('Booking is already paid');
      }

      const totalPrice = Number(booking.total_price);
      const paid = Number(dto.paid);


      
      const previousAccount = await this.accountsRepository.findOne({
        where: { booking_id: booking.booking_id },
        order: { payment_date: 'DESC' },
      });

      let previousDue = 0;
      let due;

      if (previousAccount) {
        previousDue = previousAccount.due;
         due = previousDue - paid;
      }else{
         due = totalPrice - paid;
      }
      

      const account = this.accountsRepository.create({
        booking_id: booking.booking_id,
        total_price: totalPrice,
        paid,
        due,
        payment_type: dto.payment_type,
        transaction_id: dto.transaction_id,
        payment_date: new Date(),
      });

      let savedAccount: Accounts;
      try {
        savedAccount = await this.accountsRepository.save(account);
      } catch (error) {
        throw new InternalServerErrorException(`Failed to save account: ${error.message}`);
      }

      // Update payment status if due is 0
      if (due === 0) {
        try {
          await this.bookingRepository.update(booking_id, { payment_status: PaymentStatus.PAID });
        } catch (error) {
          throw new InternalServerErrorException(`Failed to update payment status: ${error.message}`);
        }
      }

      return {
        payment_id: savedAccount.payment_id,
        booking_id: booking_id,
        total_price: savedAccount.total_price,
        paid: savedAccount.paid,
        due: savedAccount.due,
        payment_type: savedAccount.payment_type,
        transaction_id: savedAccount.transaction_id,
        payment_date: savedAccount.payment_date,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(`Failed to create account: ${error.message}`);
    }
  }

  // Checkout
  async checkout(dto: CheckoutDto) {
    try {
      const booking = await this.bookingRepository.findOne({
        where: { booking_id: dto.booking_id },
        relations: ['customer', 'coupon', 'employee'],
      });
      if (!booking) {
        return { message: 'Booking not found' };
      }

      // Check payment status
      if (booking.payment_status !== PaymentStatus.PAID) {
        return { message: 'Booking is not fully paid' };
      }



      try {
        await this.bookingRepository.update(dto.booking_id, { is_checkedout: true });
      } catch (error) {
        throw new InternalServerErrorException(`Failed to update booking checkout status: ${error.message}`);
      }

      await this.roomsRepository.update(
        { room_num: In(booking.room_num) },
        { room_status: RoomStatus.AVAILABLE }
      );

      // Save to BookingHistory
      const bookingHistory = this.bookingHistoryRepository.create({
        booking_id: dto.booking_id,
        customer: booking.customer,
        customer_id: booking.customer_id, // Explicitly set customer_id
        checkin_date: booking.checkin_date,
        checkout_date: booking.checkout_date,
        room_num: booking.room_num,
        number_of_guests: booking.number_of_guests,
        room_price: booking.room_price,
        coupon: booking.coupon || undefined,
        coupon_percent: booking.coupon_percent,
        total_price: booking.total_price,
        payment_status: booking.payment_status,
        booking_date: booking.booking_date,
        typeOfBooking: booking.typeOfBooking,
        service_asked: booking.service_asked,
        is_checkedout: booking.is_checkedout,
        employee: booking.employee,
      });

      



      try {
        await this.bookingHistoryRepository.save(bookingHistory);
      } catch (error) {
        throw new InternalServerErrorException(`Failed to save booking history: ${error.message}`);
      }

      // Delete from Booking
      try {
        await this.bookingRepository.delete(dto.booking_id);
      } catch(error) {
        throw new InternalServerErrorException(`Failed to delete booking: ${error.message}`);
      }

      return { message: 'Checkout successful, booking moved to history' };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(`Failed to checkout: ${error.message}`);
    }
  }

  // Search by payment status
  async searchByPaymentStatus(dto: SearchByPaymentStatusDto) {
    try {
      const bookings = await this.bookingRepository.find({
        where: { payment_status: dto.payment_status },
        relations: ['customer', 'coupon', 'employee'],
      });

      return bookings.map(booking => ({
        booking_id: booking.booking_id,
        customer_id: booking.customer_id,
        customer_name: booking.customer?.name,
        checkin_date: booking.checkin_date,
        checkout_date: booking.checkout_date,
        room_num: booking.room_num,
        number_of_guests: booking.number_of_guests,
        room_price: booking.room_price,
        coupon_code: booking.coupon?.coupon_code,
        total_price: booking.total_price,
        payment_status: booking.payment_status,
        booking_date: booking.booking_date,
        typeOfBooking: booking.typeOfBooking,
        service_asked: booking.service_asked,
        is_checkedout: booking.is_checkedout,
        employee_id: booking.employee?.employee_id,
      }));
    } catch (error) {
      throw new InternalServerErrorException(`Failed to search bookings by payment status: ${error.message}`);
    }
  }

  // Search by type of booking
  async searchByTypeOfBooking(dto: SearchByTypeOfBookingDto) {
    try {
      const bookings = await this.bookingRepository.find({
        where: { typeOfBooking: dto.typeOfBooking },
        relations: ['customer', 'coupon', 'employee'],
      });

      return bookings.map(booking => ({
        booking_id: booking.booking_id,
        customer_id: booking.customer_id,
        customer_name: booking.customer?.name,
        checkin_date: booking.checkin_date,
        checkout_date: booking.checkout_date,
        room_num: booking.room_num,
        number_of_guests: booking.number_of_guests,
        room_price: booking.room_price,
        coupon_code: booking.coupon?.coupon_code,
        total_price: booking.total_price,
        payment_status: booking.payment_status,
        booking_date: booking.booking_date,
        typeOfBooking: booking.typeOfBooking,
        service_asked: booking.service_asked,
        is_checkedout: booking.is_checkedout,
        employee_id: booking.employee?.employee_id,
      }));
    } catch (error) {
      throw new InternalServerErrorException(`Failed to search bookings by type of booking: ${error.message}`);
    }
  }

  // Search by coupon code
  async searchByCouponCode(dto: SearchByCouponCodeDto) {
    try {
      const coupon = await this.couponRepository.findOne({
        where: { coupon_code: dto.coupon_code },
      });
      if (!coupon) {
        return { message: `Coupon code ${dto.coupon_code} not found`, bookings: [] };
      }

      const bookings = await this.bookingRepository.find({
        where: { coupon: { coupon_id: coupon.coupon_id } },
        relations: ['customer', 'coupon', 'employee'],
      });

      return {
        coupon_code: dto.coupon_code,
        bookings: bookings.map(booking => ({
          booking_id: booking.booking_id,
          customer_id: booking.customer_id,
          customer_name: booking.customer?.name,
          checkin_date: booking.checkin_date,
          checkout_date: booking.checkout_date,
          room_num: booking.room_num,
          number_of_guests: booking.number_of_guests,
          room_price: booking.room_price,
          coupon_code: booking.coupon?.coupon_code,
          total_price: booking.total_price,
          payment_status: booking.payment_status,
          booking_date: booking.booking_date,
          typeOfBooking: booking.typeOfBooking,
          service_asked: booking.service_asked,
          is_checkedout: booking.is_checkedout,
          employee_id: booking.employee?.employee_id,
        })),
      };
    } catch (error) {
      throw new InternalServerErrorException(`Failed to search bookings by coupon code: ${error.message}`);
    }
  }


  // Get all bookings
  async viewAllBooking() {
    try {
      const bookings = await this.bookingRepository.find({
        relations: ['customer', 'coupon', 'employee'],
      });

      return bookings.map(booking => ({
        booking_id: booking.booking_id,
        customer_id: booking.customer_id,
        customer_name: booking.customer?.name,
        checkin_date: booking.checkin_date,
        checkout_date: booking.checkout_date,
        room_num: booking.room_num,
        number_of_guests: booking.number_of_guests,
        room_price: booking.room_price,
        coupon_code: booking.coupon?.coupon_code,
        total_price: booking.total_price,
        payment_status: booking.payment_status,
        booking_date: booking.booking_date,
        typeOfBooking: booking.typeOfBooking,
        service_asked: booking.service_asked,
        is_checkedout: booking.is_checkedout,
        employee_id: booking.employee?.employee_id,
      }));
    } catch (error) {
      throw new InternalServerErrorException(`Failed to get all bookings: ${error.message}`);
    }
  }

//search account by booking id
  async searchAccountByBookingId(booking_id: number) {
    try {
      const accounts = await this.accountsRepository.find({
        where: { booking_id: booking_id },
        
      });

      return accounts.map(account => ({
        payment_id: account.payment_id,
        booking_id: booking_id,
        total_price: account.total_price,
        paid: account.paid,
        due: account.due,
        payment_type: account.payment_type,
        transaction_id: account.transaction_id,
        payment_date: account.payment_date,
      }));
    } catch (error) {
      throw new InternalServerErrorException(`Failed to search accounts by booking ID: ${error.message}`);
    }
  }


  // search by booking id
  async searchBookingById(booking_id: number) {
    try {
      const booking = await this.bookingRepository.findOne({
        where: { booking_id },
        relations: ['customer', 'coupon', 'employee'],
      });
      if (!booking) {
        return { message: 'Booking not found' };
      }

      return {
        booking_id: booking.booking_id,
        customer_id: booking.customer_id,
        customer_name: booking.customer?.name,
        checkin_date: booking.checkin_date,
        checkout_date: booking.checkout_date,
        room_num: booking.room_num,
        number_of_guests: booking.number_of_guests,
        room_price: booking.room_price,
        coupon_code: booking.coupon?.coupon_code,
        total_price: booking.total_price,
        payment_status: booking.payment_status,
        booking_date: booking.booking_date,
        typeOfBooking: booking.typeOfBooking,
        service_asked: booking.service_asked,
        is_checkedout: booking.is_checkedout,
        employee_id: booking.employee?.employee_id,
      };
    } catch (error) {
      throw new InternalServerErrorException(`Failed to search bookings by ID: ${error.message}`);
    }
  }



 async viewAllBookingHistory() {
   
      const bookings = await this.bookingHistoryRepository.find({ });

      return bookings;
   
  }




 



 
}