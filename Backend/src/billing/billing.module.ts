import { Module, forwardRef } from '@nestjs/common';
import { BillingController } from './billing.controller';
import { BillingService } from './billing.service';
import { BookingModule } from '../booking/booking.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RestaurantModule } from '../restaurant/restaurant.module';
import { Accounts } from 'src/booking/entities/accounts.entity';
import { Restaurant } from 'src/restaurant/entities/restaurant.entity';
import { BillingHistory } from './entities/billing-history.entity'; 
import { Booking } from 'src/booking/entities/booking.entity';


@Module({
  imports: [ 
    TypeOrmModule.forFeature([Accounts, Restaurant, BillingHistory, Booking]),
    forwardRef(() => BookingModule),
    forwardRef(() => RestaurantModule),
  ],
  controllers: [BillingController],
  providers: [BillingService]
})
export class BillingModule {}
