import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { RestaurantService } from './restaurant.service';
import { CreateRestaurantDto } from './dtos/create-restaurant.dto';
import { UpdateRestaurantDto } from './dtos/update-restaurant.dto';
import { CreateRestaurantHistoryDto } from './dtos/create-restaurant-history.dto';

@Controller('restaurant')
export class RestaurantController {
  constructor(private readonly restaurantService: RestaurantService) {}

  @Post('createFood')
  createRestaurant(@Body() createRestaurantDto: CreateRestaurantDto) {
    return this.restaurantService.createRestaurant(createRestaurantDto);
  }

  @Get('findAllFood')
  findAllRestaurants() {
    return this.restaurantService.findAllRestaurants();
  }

  @Get('findOne/:id')
  findOneRestaurant(@Param('id') id: number) {
    return this.restaurantService.findOneRestaurant(id);
  }


  //find food by name
  @Get('findByName/:name')
  findByName(@Param('name') name: string) {
    return this.restaurantService.findByName(name);
  }






  @Put('update/:id')
  updateRestaurant(
    @Param('id') id: number,
    @Body() updateRestaurantDto: UpdateRestaurantDto,
  ) {
    return this.restaurantService.updateRestaurant(id, updateRestaurantDto);
  }

  @Delete('delete/:id')
  deleteRestaurant(@Param('id') id: number) {
    return this.restaurantService.deleteRestaurant(id);
  }

  @Post('history/create')
  createRestaurantHistory(
    @Body() createRestaurantHistoryDto: CreateRestaurantHistoryDto,
  ) {
    return this.restaurantService.createRestaurantHistory(
      createRestaurantHistoryDto,
    );
  }

  @Get('history/findAll')
  findAllRestaurantHistories() {
    return this.restaurantService.findAllRestaurantHistories();
  }

  @Get('history/findOne/:id')
  findOneRestaurantHistory(@Param('id') id: number) {
    return this.restaurantService.findOneRestaurantHistory(id);
  }
}
