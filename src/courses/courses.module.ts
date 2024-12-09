import { Module } from '@nestjs/common';
import { CoursesController } from './courses.controller';
import { CoursesService } from './courses.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from './entities/course.entity';
import { Prerequisite } from './entities/prerequisite.entity';
import { FirebaseAdmin } from '../../config/firebase.setup';

@Module({
  imports: [TypeOrmModule.forFeature([Course, Prerequisite])],
  controllers: [CoursesController],
  providers: [CoursesService, FirebaseAdmin],
})
export class CoursesModule {}
