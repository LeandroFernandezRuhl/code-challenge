import {
  Controller,
  Post,
  Body,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { Auth } from '../decorators/auth.decorator';

@Controller('courses')
export class CoursesController {
  private readonly logger = new Logger(CoursesController.name);

  constructor(private readonly coursesService: CoursesService) {}

  @Post('schedule')
  @Auth('USER')
  async createSchedule(@Body() data: CreateScheduleDto) {
    this.logger.log(
      `Received createSchedule request with data: ${JSON.stringify(data)}`,
    );

    try {
      const order = await this.coursesService.generateStudySchedule(
        data.courses,
      );
      this.logger.log(
        `Successfully generated schedule for courses: ${JSON.stringify(data.courses)}`,
      );
      return { schedule: order };
    } catch (err) {
      this.logger.error('Failed to generate study schedule', err.stack);
      throw new BadRequestException(
        'Failed to generate study schedule. Please try again later.',
      );
    }
  }
}
