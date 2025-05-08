import { Injectable} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto, UpdateUserDto } from './DTOs/user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}



  async createUser(dto: CreateUserDto) {
    const existingUser = await this.userRepository.findOne({
      where: [{ email: dto.email }, { nid: dto.nid }],
    });
    if (existingUser) {
      return { message: 'email or nid is already exits!'};
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = this.userRepository.create({
      ...dto,
      password: hashedPassword,
    });
    await this.userRepository.save(user);
    return { message: 'User created successfully'};
    
  }




  async findAllUsers() {
    const users = await this.userRepository.find();
    return users;
  }




  async findUserById(id: number){
    const user = await this.userRepository.findOne({ where: { user_id: id } });
    if (!user) {
      return { message: 'user not found!'};
    }
    return user;
  }


  async findUserByName(name: string){
    const user = await this.userRepository.find({where: {name: ILike(`%${name}%`)}});
    if (user.length === 0) {
      return { message: 'user not found!'};
    }
    return user;
  } 


  async updateUser(id: number, dto: UpdateUserDto){
    
    const user = await this.userRepository.findOne({ where: { user_id: id } });
    if (!user) {
      return { message: 'user not found!'};
    }

    if (dto.password){
      dto.password = await bcrypt.hash(dto.password, 10);
    }
    
    if(dto.phone){
      const existPhone = await this.userRepository.findOne({
        where: { phone: dto.phone },
      });
      if (existPhone) {
        return { message: 'Phone number already exists' };
      }
    }

    Object.assign(user, dto);
    await this.userRepository.save(user);

    return { message: 'users information is updated' };
  }

  async deleteUser(id: number){
    const user = await this.userRepository.findOne({ where: { user_id: id } });
    if (!user) {
      return { message: 'user not found!'};
    }
    await this.userRepository.remove(user);
    return { message: 'user has been removed'};
  }
}