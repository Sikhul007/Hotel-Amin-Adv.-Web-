import { Controller, Post, Body, Get, Param, Patch, Delete, ParseIntPipe } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto, UpdateUserDto } from './DTOs/user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('createuser')
  async createUser(@Body() dto: CreateUserDto){
    return this.userService.createUser(dto);
  }

  @Get('allusers')
  async findAllUsers(){
    return this.userService.findAllUsers();
  }

  @Get('findbyid/:id')
  async findUserById(@Param('id', ParseIntPipe) id: number){
    return this.userService.findUserById(id);
  }

  //find by name
  @Get('findbyname/:name')
  async findUserByName(@Param('name') name: string){
    return this.userService.findUserByName(name);
  }

  @Patch('updateuser/:id')
  async updateUser(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateUserDto,) {
    return this.userService.updateUser(id, dto);
  }

  @Delete('delete/:id')
  async deleteUser(@Param('id', ParseIntPipe) id: number){
    return this.userService.deleteUser(id);
  }
}