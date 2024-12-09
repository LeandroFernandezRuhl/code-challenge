import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { Auth } from '../decorators/auth.decorator';

@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post('schedule')
  @Auth('USER')
  async createSchedule(@Body() data: CreateScheduleDto) {
    try {
      const order = await this.coursesService.generateStudySchedule(
        data.courses,
      );
      return { schedule: order };
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }
}
