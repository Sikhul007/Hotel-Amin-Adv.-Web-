import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Feedback } from './entities/feedback.entity';
import { User } from '../user/entities/user.entity';
import { CreateFeedbackDto } from './dtos/createFeedback.dto';
import { UpdateFeedbackDto } from './dtos/updateFeedback.dto';

    
@Injectable()
export class FeedbackService {
  

  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Feedback) private feedbackRepository: Repository<Feedback>
    ) {}


    async create(dto: CreateFeedbackDto){
      const user = await this.userRepository.findOneBy({ user_id: dto.user_id });
      if (!user) {
        return { message: 'user not found' };
      }
      const feedback = this.feedbackRepository.create({
        feedback: dto.feedback,
        user, 
      });
      await this.feedbackRepository.save(feedback);
      return { message: 'Feedback created successfully' };
    } 

  async findOne(id: number){
    const feedback = await this.feedbackRepository.findOne({ where: { feedback_id: id }}); //relations: ['user'] if needed
    if (!feedback) {
      return { message: 'no feedback found with this feedbackid' };
    }

    return feedback; 
  }


  async findByUserId(id: number){
    const feedbacks = await this.feedbackRepository.find({ where: { user_id: id }});
    if (feedbacks.length === 0) {
      return { message: 'no feedback found for this user' };
    }
    return feedbacks;
  }


  async update(id: number, dto: UpdateFeedbackDto){
    const feedback = await this.feedbackRepository.findOne({ where: { feedback_id: id } });
    if (!feedback) {
      return { message: 'no feedback found' };
    }
    Object.assign(feedback, dto); 
    await this.feedbackRepository.save(feedback);
    return { message: 'Feedback updated successfully' };
  }

  async delete(id: number){
    const feedback = await this.feedbackRepository.findOne({ where: { feedback_id: id } });
    if (!feedback) {
      return { message: 'feedback not found' };
    }
    await this.feedbackRepository.remove(feedback);
    return { message: 'Feedback deleted successfully' };
  }

  async findAll(){
    const feedbacks = await this.feedbackRepository.find();
    if (!feedbacks) {
      return { message: 'Feedback not found' };
    }
    return feedbacks;
  }



}