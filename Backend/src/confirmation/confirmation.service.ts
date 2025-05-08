import { Injectable, Logger,Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Twilio } from 'twilio';
import { Reservation } from '../reservation/entities/reservation.entity';
import { parsePhoneNumberWithError} from 'libphonenumber-js';
import { CACHE_MANAGER,  } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class ConfirmationService {
  private readonly logger = new Logger(ConfirmationService.name);

  constructor(
    @Inject('TWILIO_CLIENT')
    private twilioClient: Twilio,
    private configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async sendReservationConfirmation(reservation: Reservation): Promise<void> {
    const customer = reservation.user;
    if (!customer?.phone) {
      this.logger.warn(`No phone number for customer ID ${reservation.reservation_id}`);
      return;
    }

    // Validate phone number
    let phoneNumber: string;
    try {
      const parsed = parsePhoneNumberWithError(customer.phone, 'BD');
      if (!parsed.isValid()) {
        this.logger.warn(`Invalid phone number for customer ID ${reservation.reservation_id}: ${customer.phone}`);
        return;
      }
      phoneNumber = parsed.format('E.164');
    } catch (error) {
      this.logger.warn(`Failed to parse phone number ${customer.phone}: ${error.message}`);
      return;
    }

    // Check rate limit (one SMS per reservation ID)
    const cacheKey = `sms:reservation:${reservation.reservation_id}`;
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      this.logger.warn(`SMS already sent for reservation ID ${reservation.reservation_id}`);
      return;
    }

    const message = `
      Dear ${customer.name},
      Your reservation is confirmed!
      Reservation ID: ${reservation.reservation_id}
      Check-in: ${reservation.checkin_date.toISOString().split('T')[0]}
      Check-out: ${reservation.checkout_date.toISOString().split('T')[0]}
      Rooms: ${reservation.room_num.join(', ')}
      Guests: ${reservation.number_of_guests}
    
      Thank you for choosing us!
    `.trim();

    try {
      await this.twilioClient.messages.create({
        body: message,
        from: this.configService.get<string>('TWILIO_PHONE_NUMBER'),
        to: phoneNumber,
      });
      this.logger.log(`SMS sent to ${phoneNumber} for reservation ID ${reservation.reservation_id}`);
      
      // Set cache to prevent duplicate SMS (TTL: 24 hours)
      await this.cacheManager.set(cacheKey, 'sent', 24 * 60 * 60 * 1000);
    } catch (error) {
      this.logger.error(`Failed to send SMS to ${phoneNumber}: ${error.message}`);
    }
  } 
}