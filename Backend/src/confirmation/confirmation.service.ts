import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as nodemailer from 'nodemailer';
import * as handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';
import { Reservation } from '../reservation/entities/reservation.entity';
import { User } from '../user/entities/user.entity';

@Injectable()
export class ConfirmationService {
  private transporter: nodemailer.Transporter;

  constructor(
    @InjectRepository(Reservation)
    private reservationRepository: Repository<Reservation>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {
    // Initialize Nodemailer transporter
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: false, // Use TLS
      auth: {
        user: process.env.EMAIL_USER || 'your.email@gmail.com',
        pass: process.env.EMAIL_PASS || 'your_app_password',
      },
    });
  }

  async sendReservationConfirmation(reservation: Reservation): Promise<void> {
    // Fetch user details
    const user = await this.userRepository.findOne({
      where: { user_id: reservation.user_id },
    });

    if (!user) {
      throw new Error(`User with ID ${reservation.user_id} not found`);
    }

    // Load and compile email template
    const templatePath = path.join(__dirname, '..', '..', 'templates', 'confirmation.hbs');
    const templateSource = fs.readFileSync(templatePath, 'utf8');
    const template = handlebars.compile(templateSource);

    // Prepare email data
    const emailData = {
      customerName: user.name,
      booking_id: reservation.reservation_id,
      checkin_date: reservation.checkin_date,
      checkout_date: reservation.checkout_date,
      room_num: reservation.room_num.join(', '),
      number_of_guests: reservation.number_of_guests,
      total_price: reservation.total_price,
    };

    const html = template(emailData);

    // Send email
    const mailOptions = {
      from: `"Hotel Amin International" <${process.env.EMAIL_USER || 'your.email@gmail.com'}>`,
      to: user.email,
      subject: `Your Reservation Confirmation - Reservation #${reservation.reservation_id}`,
      html,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Confirmation email sent to ${user.email}`);
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Failed to send confirmation email');
    }
  }
}