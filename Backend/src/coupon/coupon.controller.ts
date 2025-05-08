import { Controller, Post, Body, Get, Param, Patch, Delete, ParseIntPipe } from '@nestjs/common';
import { CouponService } from './coupon.service';
import { CreateCouponDto } from './dtos/create-coupon.dto';
import { UpdateCouponDto } from './dtos/update-coupon.dto';

 
@Controller('coupons')
export class CouponController {
  constructor(private readonly couponService: CouponService) {}

  @Post('create-coupon')
  async createCoupon(@Body() dto: CreateCouponDto) {
    return this.couponService.createCoupon(dto);
  }

  @Get('search-by-coupon-code/:coupon_code')
  async findCouponByCouponCode(@Param('coupon_code') coupon_code: string) {
    return this.couponService.findCouponByCouponCode(coupon_code);
  }

  @Get('search-all')
  async searchAllCoupons() {
    return this.couponService.searchAllCoupons();
  }

  @Patch('update-coupon/:coupon_id')
  async updateCoupon(@Param('coupon_id', ParseIntPipe) coupon_id: number, @Body() dto: UpdateCouponDto) {
    return this.couponService.updateCoupon(coupon_id, dto);
  }




  @Delete('delete-coupon/:coupon_code')
  async deleteCoupon(@Param('coupon_code') coupon_code: string) {
    return this.couponService.deleteCoupon(coupon_code);
  }

    @Get('search-by-coupon-percent/:coupon_percent')
  async findCouponsByCouponPercent(@Param('coupon_percent', ParseIntPipe) coupon_percent: number) {
    return this.couponService.findCouponsByCouponPercent(coupon_percent);
  }
}