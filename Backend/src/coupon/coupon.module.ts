import { forwardRef, Module } from '@nestjs/common';
import { CouponController } from './coupon.controller';
import { CouponService } from './coupon.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Coupon } from './entities/coupon.entity';
import { CouponUsage } from './entities/coupon-usage.entity';
import { ManagementModule } from '../management/management.module';
import { BookingModule } from '../booking/booking.module';


@Module({
  imports: [
    TypeOrmModule.forFeature([CouponUsage, Coupon]),
    ManagementModule,
    forwardRef(() => BookingModule),
  ],

  controllers: [CouponController],
  providers: [CouponService],
  exports: [CouponService,TypeOrmModule],
})
export class CouponModule {}

