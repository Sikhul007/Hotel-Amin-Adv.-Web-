import { Controller, Post, Body, Get, Param, Patch, Delete, ParseIntPipe } from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto } from './dtos/createFeedback.dto';
import { UpdateFeedbackDto } from './dtos/updateFeedback.dto';

@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post('createfeedback')
  async create(@Body() dto: CreateFeedbackDto) {
    return this.feedbackService.create(dto);
  }

  @Get('searchbyid/:id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.feedbackService.findOne(id);
  }

  //searchby userid
  @Get('searchbyuserid/:id')
  async findByUserId(@Param('id', ParseIntPipe) id: number) {
    return this.feedbackService.findByUserId(id);
  }

  @Patch('feedbackupdate/:id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateFeedbackDto) {
    return this.feedbackService.update(id, dto);
  }

  @Delete('deletefeedback/:id')
  async delete(@Param('id', ParseIntPipe) id: number){
    return this.feedbackService.delete(id);
  }

  @Get('allfeedbacks')
  async findAll() {
    return this.feedbackService.findAll();
  }
}
