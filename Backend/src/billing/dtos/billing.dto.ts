export class BillingResponseDto {
    booking_id: number;
    checkin_date: Date;
    checkout_date: Date;
    number_of_guests: number;
    total_price: number;
    room_num: number[];
    accounts: {
      total_price: number;
      paid: number;
      due: number;
      payment_date: Date;
      payment_type: string | null;
    }[];
    restaurant_history?: {
      order_id: number;
      food_name: string;
      quantity: number;
      food_price: number;
      order_date: Date;
      total: number;
    }[];
    restaurant_total?: number;
  }