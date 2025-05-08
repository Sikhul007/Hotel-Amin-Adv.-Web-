import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Restaurant } from './entities/restaurant.entity';
import { RestaurantHistory } from './entities/restaurant-history.entity';
import { Booking } from '../booking/entities/booking.entity';
import { Employee } from '../management/entities/employee.entity';
import { CreateRestaurantDto } from './dtos/create-restaurant.dto';
import { UpdateRestaurantDto } from './dtos/update-restaurant.dto';
import { CreateRestaurantHistoryDto } from './dtos/create-restaurant-history.dto';

@Injectable()
export class RestaurantService {
  constructor(
    @InjectRepository(Restaurant)
    private restaurantRepository: Repository<Restaurant>,
    @InjectRepository(RestaurantHistory)
    private restaurantHistoryRepository: Repository<RestaurantHistory>,
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
    @InjectRepository(Employee)
    private employeeRepository: Repository<Employee>,
  ) {}

  // Restaurant CRUD Operations
  async createRestaurant(
    createRestaurantDto: CreateRestaurantDto,
  ): Promise<Restaurant> {
    const restaurant = this.restaurantRepository.create(createRestaurantDto);
    return this.restaurantRepository.save(restaurant);
  }

  async findAllRestaurants(): Promise<Restaurant[]> {
    return this.restaurantRepository.find({
      relations: ['restaurantHistory'],
    });
  }

  async findOneRestaurant(id: number): Promise<Restaurant> {
    const restaurant = await this.restaurantRepository.findOne({
      where: { food_id: id },
      
    });
    if (!restaurant) {
      throw new NotFoundException(`Restaurant with ID ${id} not found`);
    }
    return restaurant;
  }



  async findByName(name: string): Promise<Restaurant[]> {
    const restaurants = await this.restaurantRepository.find({
      where: { item_name: ILike(`%${name}%`) },
    });
    if (restaurants.length === 0) {
      throw new NotFoundException(`No Restaurant found with name ${name}`);
    }
    return restaurants;
  }





  async updateRestaurant(
    id: number,
    updateRestaurantDto: UpdateRestaurantDto,
  ): Promise<Restaurant> {
    const restaurant = await this.findOneRestaurant(id);
    Object.assign(restaurant, updateRestaurantDto);
    return this.restaurantRepository.save(restaurant);
  }

  async deleteRestaurant(id: number) {
    const restaurant = await this.findOneRestaurant(id);
    await this.restaurantRepository.remove(restaurant);
    return { message: 'Restaurant deleted successfully' };
  }

  // RestaurantHistory Operations
  async createRestaurantHistory(
    createRestaurantHistoryDto: CreateRestaurantHistoryDto,
  ): Promise<RestaurantHistory[]> {
    const { items, booking_id, food_id, employee_id } =
      createRestaurantHistoryDto;

    // Validate booking_id
    const booking = await this.bookingRepository.findOne({
      where: { booking_id },
    });
    if (!booking) {
      throw new NotFoundException(`Booking with ID ${booking_id} not found`);
    }

    // Validate employee_id
    const employee = await this.employeeRepository.findOne({
      where: { employee_id },
    });
    if (!employee) {
      throw new NotFoundException(`Employee with ID ${employee_id} not found`);
    }

    // Validate food_id
    const food = await this.restaurantRepository.findOne({
      where: { food_id },
    });
    if (!food) {
      throw new NotFoundException(`Food with ID ${food_id} not found`);
    }

    // Transform items object into array of ItemQuantity objects
    const itemQuantities: { itemName: string; quantity: number }[] = [];
    for (const [itemName, quantity] of Object.entries(items)) {
      itemQuantities.push({ itemName, quantity });
    }

    // Process each item and create a history record
    const historyRecords: RestaurantHistory[] = [];
    for (const { itemName, quantity } of itemQuantities) {
      // Validate item exists in Restaurant table
      const restaurantItem = await this.restaurantRepository.findOne({
        where: { item_name: itemName },
      });
      if (!restaurantItem) {
        console.warn(
          `Item '${itemName}' not found in Restaurant table, skipping...`,
        );
        continue; // Skip this item if not found
      }

      // Create a history record for this item
      const historyRecord = this.restaurantHistoryRepository.create({
        food: restaurantItem,
        quantity,
        food_price: restaurantItem.item_price, // Fetch price from Restaurant table
        order_date: new Date(),
        booking,
        billed_by: employee,
      });

      const savedRecord =
        await this.restaurantHistoryRepository.save(historyRecord);
      historyRecords.push(savedRecord);
    }

    if (historyRecords.length === 0) {
      throw new BadRequestException(
        'No valid items were provided to create history records',
      );
    }

    return historyRecords;
  }

  async findAllRestaurantHistories(): Promise<RestaurantHistory[]> {
    return this.restaurantHistoryRepository.find({
      relations: ['food', 'booking', 'billed_by'],
    });
  }

  async findOneRestaurantHistory(id: number): Promise<RestaurantHistory> {
    const history = await this.restaurantHistoryRepository.findOne({
      where: { order_id: id },
      relations: ['food', 'booking', 'billed_by'],
    });
    if (!history) {
      throw new NotFoundException(`RestaurantHistory with ID ${id} not found`);
    }
    return history;
  }
}
