import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from '../booking/entities/booking.entity';
import { Accounts } from '../booking/entities/accounts.entity';
import { RestaurantHistory } from '../restaurant/entities/restaurant-history.entity';
import { BillingHistory } from './entities/billing-history.entity';
import { BillingResponseDto } from './dtos/billing.dto';
import { Restaurant } from '../restaurant/entities/restaurant.entity';
import * as puppeteer from 'puppeteer';
import * as handlebars from 'handlebars';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class BillingService {
  constructor(
    @InjectRepository(Accounts)
    private accountsRepository: Repository<Accounts>,
    @InjectRepository(RestaurantHistory)
    private restaurantHistoryRepository: Repository<RestaurantHistory>,
    @InjectRepository(BillingHistory)
    private billingHistoryRepository: Repository<BillingHistory>,
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
    @InjectRepository(Restaurant)
    private restaurantRepository: Repository<Restaurant>,

  ) {}

  async generateBillingPdf(roomNum: number): Promise<{ pdfBuffer: Buffer; responseDto: BillingResponseDto }> {
    // Find active booking
    const booking = await this.bookingRepository
    .createQueryBuilder('booking')
    .where(':roomNum = ANY(booking.room_num)', { roomNum })
    .getOne();

    if (!booking) {
      throw new NotFoundException(`No active booking found for room ${roomNum}`);
    }

    // Fetch Accounts
    const accounts = await this.accountsRepository.find({
      where: { booking_id: booking.booking_id },
    });

    // Fetch RestaurantHistory
    const restaurantHistories = await this.restaurantHistoryRepository.find({
        where: { booking_id: booking.booking_id },
        relations:['food']
      });

    // Calculate restaurant total
    const restaurantTotal = restaurantHistories.reduce(
      (total, rh) => total + rh.quantity * rh.food_price,
      0,
    );
 
    // Prepare response DTO
    const responseDto: BillingResponseDto = {
      booking_id: booking.booking_id,
      checkin_date: booking.checkin_date,
      checkout_date: booking.checkout_date,
      number_of_guests: booking.number_of_guests,
      total_price: booking.total_price,
      room_num: booking.room_num,
      accounts: accounts.map((acc) => ({
        total_price: acc.total_price,
        paid: acc.paid,
        due: acc.due,
        payment_date: acc.payment_date,
        payment_type: acc.payment_type,
      })),
      restaurant_history: restaurantHistories.length > 0
        ? restaurantHistories.map((rh) => ({
            order_id: rh.order_id,
            food_name: rh.food.item_name || 'Unknown',
            quantity: rh.quantity,
            food_price: rh.food_price,
            order_date: rh.order_date,
            total: rh.quantity * rh.food_price,
          }))
        : undefined,
      restaurant_total: restaurantTotal > 0 ? restaurantTotal : undefined,
    };

    // HTML template
    const templatePath = path.join(__dirname, '..', '..', 'templates', 'bill.hbs');
    const templateSource = fs.readFileSync(templatePath, 'utf8');
    const template = handlebars.compile(templateSource);

    const html = template({
      booking_id: booking.booking_id,
      checkin_date: booking.checkin_date,
      checkout_date: booking.checkout_date,
      number_of_guests: booking.number_of_guests,
      total_price: booking.total_price,
      room_num: booking.room_num.join(', '),
      accounts: accounts.map((acc) => ({
        total_price: acc.total_price,
        paid: acc.paid,
        due: acc.due,
        payment_date: acc.payment_date,
        payment_type: acc.payment_type || '-',
      })),
      restaurant_history: restaurantHistories.length > 0
        ? restaurantHistories.map((rh) => ({
            order_id: rh.order_id,
            food_name: rh.food?.item_name || 'Unknown',
            quantity: rh.quantity,
            total: (rh.quantity * rh.food_price).toFixed(2),
          }))
        : null,
      restaurant_total: restaurantTotal > 0 ? restaurantTotal.toFixed(2) : null,
      issued_date: new Date(),
    });

    // Generate PDF with puppeteer
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setContent(html);
    const pdfData = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '1in', bottom: '1in', left: '0.75in', right: '0.75in' },
    });
    const pdfBuffer = Buffer.from(pdfData);
    await browser.close();

    // Save PDF to BillingHistory
    const billingHistory = this.billingHistoryRepository.create({
      booking_id: booking.booking_id,
      room_num: roomNum,
      pdf_data: pdfBuffer,
      generated_date: new Date(),
    });
    await this.billingHistoryRepository.save(billingHistory);

    return { pdfBuffer, responseDto };
  }
}