import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThanOrEqual, Repository } from 'typeorm';
import { Coupon } from './entities/coupon.entity';
import { CreateCouponDto } from './dtos/create-coupon.dto';
import { UpdateCouponDto } from './dtos/update-coupon.dto';


@Injectable()
export class CouponService {
  constructor(
    @InjectRepository(Coupon)
    private couponRepository: Repository<Coupon>,
  ) {}

  async createCoupon(dto: CreateCouponDto) {
    const existingCoupon = await this.couponRepository.findOne({ where: { coupon_code: dto.coupon_code } });
    if (existingCoupon) {
      return { message: 'Coupon already exists' };
    }
    const coupon = this.couponRepository.create(dto);
    await this.couponRepository.save(coupon);
    return { message: 'Coupon created successfully' };
  }

  async findCouponByCouponCode(coupon_code: string) {
    const coupon = await this.couponRepository.findOne({ where: { coupon_code } });
    if (!coupon) {
      return { message: 'Coupon not found' };
    }
    return coupon;
  }
  async searchAllCoupons() {
    const coupons = await this.couponRepository.find();
    if (coupons.length === 0) {
      return { message: 'No coupons found' };
    }
    return coupons;
  }

  async updateCoupon(coupon_id: number, dto: UpdateCouponDto) {
    const coupon = await this.couponRepository.findOne({ where: { coupon_id } });
    if (!coupon) {
      return { message: 'Coupon not found' };
    }
    Object.assign(coupon, dto);
    
    await this.couponRepository.save(coupon);
    
    return { message: 'Coupon updated successfully' };

  }

  async deleteCoupon(coupon_code:string) {
    const coupon = await this.couponRepository.findOne({ where: { coupon_code: coupon_code } });
    if (!coupon) {
      return { message: 'Coupon not found' };
    }
    await this.couponRepository.remove(coupon);
    return { message: 'Coupon deleted successfully' };
  }


  async findCouponsByCouponPercent(coupon_percent: number) {
    const coupons = await this.couponRepository.find({
      where: { coupon_percent: MoreThanOrEqual(coupon_percent) }, 
    });
  
    if (coupons.length === 0) {
      return { message: 'No coupons found with this percent or greater' };
    }
  
    return coupons;
  }

 
}