import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { HousekeepingHistory, ServiceType } from './entities/housekeeping-history.entity';
import { CreateCleanupDto, CreateServiceRequestDto } from './dtos/housekeeping.dto';
import { Rooms } from '../room/entities/room.entity';
import { Booking } from '../booking/entities/booking.entity';
import { Employee } from '../management/entities/employee.entity';
import { HousekeepingStatus } from '../room/entities/room.entity';

@Injectable()
export class HousekeepingService {
  constructor(
    @InjectRepository(HousekeepingHistory)
    private housekeepingRepository: Repository<HousekeepingHistory>,
    @InjectRepository(Rooms)
    private roomsRepository: Repository<Rooms>,
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
    @InjectRepository(Employee)
    private employeeRepository: Repository<Employee>,
  ) {}

  async createCleanup(dto: CreateCleanupDto){
    // Validate room
    const room = await this.roomsRepository.findOne({ where: { room_num: dto.room_num } });
    if (!room) {
      throw new NotFoundException(`Room ${dto.room_num} not found`);
    }

    let type_of_service : ServiceType;

    if(room.housekeeping_status === HousekeepingStatus.CLEAN){
        type_of_service = ServiceType.CLEANING;
    }else {
      type_of_service = ServiceType.MAKEOVER;
    }
   
    const existingRecord = await this.housekeepingRepository.findOne({
      where: { room_num: dto.room_num, date: new Date(), type_of_service: ServiceType.CLEANING },
    });
    if (existingRecord) {
        return { message: 'cleanup for this room is already done for today' };
    }


    
    const cleaner = await this.employeeRepository.findOne({ where: { employee_id: dto.cleaner_id } });
    if (!cleaner) {
      throw new NotFoundException(`Cleaner with ID ${dto.cleaner_id} not found`);
    }

    // Validate supervisor
    const supervisor = await this.employeeRepository.findOne({ where: { employee_id: dto.supervisor_employee_id } });
    if (!supervisor) {
      throw new NotFoundException(`Supervisor with ID ${dto.supervisor_employee_id} not found`);
    }

    // Create housekeeping record
    const housekeeping = this.housekeepingRepository.create({
        room_num: dto.room_num,
        type_of_service: type_of_service,
        issue_report: dto.issue_report, 
        cleaner_feedback: dto.cleaner_feedback,
        cleaner_id: dto.cleaner_id,
        supervisor_employee_id: dto.supervisor_employee_id,
    
    });

    // Update room housekeeping status in database, use update not save
    room.housekeeping_status = HousekeepingStatus.CLEAN;
    await this.roomsRepository.update(dto.room_num, room);
  
    

    return this.housekeepingRepository.save(housekeeping);

  }





  async createServiceRequest(roomNum: number, dto: CreateServiceRequestDto){
    // Validate room and housekeeping status
    const room = await this.roomsRepository.findOne({ where: { room_num: roomNum } });
    if (!room) {
      throw new NotFoundException(`Room ${roomNum} not found`);
    }
    if (room.housekeeping_status !== HousekeepingStatus.NEEDS_SERVICE) {
      throw new BadRequestException(`Room ${roomNum} does not require service (status: ${room.housekeeping_status})`);
    }

    // Validate cleaner
    const cleaner = await this.employeeRepository.findOne({ where: { employee_id: dto.cleaner_id } });
    if (!cleaner) {
      throw new NotFoundException(`Cleaner with ID ${dto.cleaner_id} not found`);
    }

    // Validate supervisor
    const supervisor = await this.employeeRepository.findOne({ where: { employee_id: dto.supervisor_employee_id } });
    if (!supervisor) {
      throw new NotFoundException(`Supervisor with ID ${dto.supervisor_employee_id} not found`);
    }

    const booking = await this.bookingRepository
    .createQueryBuilder('booking')
    .where(':roomNum = ANY(booking.room_num)', { roomNum })
    .getOne();

    if(!booking){
        return { message: 'booking id not found' };
    }

    // Create housekeeping record
    const housekeeping = this.housekeepingRepository.create({
        room_num: roomNum,
        type_of_service: ServiceType.SERVICE_REQUEST,
        issue_report: dto.issue_report,
        cleaner_feedback: dto.cleaner_feedback,
        cleaner_id: dto.cleaner_id,
        supervisor_employee_id: dto.supervisor_employee_id,
        booking_id: booking.booking_id
    });

   const cleanrecord = await this.housekeepingRepository.save(housekeeping);

    // Update room housekeeping status in the room table 
    room.housekeeping_status = HousekeepingStatus.CLEAN;
    await this.roomsRepository.save(room);


    //update the isserviceasked in the booking table to false
    booking.service_asked = false;
    await this.bookingRepository.save(booking);


    return cleanrecord;

  }


  async getAllRooms() {
    return this.roomsRepository.find({
      select: ['room_num', 'housekeeping_status'],
    });
  }




  async getRoomsByHousekeepingStatus(status: HousekeepingStatus) {
    return this.roomsRepository.find({
      where: { housekeeping_status: status },
      select: ['room_num', 'housekeeping_status'],
    });
  }


  async getHousekeepingHistory() {
    return this.housekeepingRepository.find({});
  }


  async getHousekeepingHistoryByDate(date: string) {
    const parsedDate = new Date(date);
    const history= this.housekeepingRepository.find({
      where: { date: parsedDate },
    });
    if (!history || (await history).length === 0) {
      return { message: 'No history found for this date' };
    }
    return history;
  }
  
  async getHousekeepingHistoryByServiceType(type: ServiceType) {
    return this.housekeepingRepository.find({
      where: { type_of_service: type },
    });
  }
} 