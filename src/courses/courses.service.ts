import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from './entities/course.entity';
import { Prerequisite } from './entities/prerequisite.entity';
import { CourseInput } from './dto/create-schedule.dto';
import { topologicalSort } from '../util/topological-sort.util';

@Injectable()
export class CoursesService {
  private readonly logger = new Logger(CoursesService.name);

  constructor(
    @InjectRepository(Course)
    private courseRepo: Repository<Course>,
    @InjectRepository(Prerequisite)
    private prereqRepo: Repository<Prerequisite>,
  ) {}

  async generateStudySchedule(inputs: CourseInput[]): Promise<string[]> {
    this.logger.log('Generating study schedule');
    const courseMap = new Map<string, Course>();

    try {
      for (const { desiredCourse, requiredCourse } of inputs) {
        let required = courseMap.get(requiredCourse);
        if (!required) {
          required = await this.createOrUpdateCourse(requiredCourse);
          courseMap.set(requiredCourse, required);
        }

        let desired = courseMap.get(desiredCourse);
        if (!desired) {
          desired = await this.createOrUpdateCourse(desiredCourse);
          courseMap.set(desiredCourse, desired);
        }

        await this.createOrUpdatePrerequisite(required.id, desired.id);
      }

      const graph = this.generateCoursesGraph(
        await this.courseRepo.find(),
        await this.prereqRepo.find(),
      );

      const sorted = topologicalSort(graph);

      this.logger.log('Successfully generated study schedule');
      return sorted;
    } catch (error) {
      this.logger.error('Error generating study schedule', error.stack);
      throw error;
    }
  }

  private async createOrUpdateCourse(name: string): Promise<Course> {
    let course = await this.courseRepo.findOne({ where: { name } });
    if (!course) {
      course = await this.courseRepo.save(this.courseRepo.create({ name }));
    }
    return course;
  }

  private async createOrUpdatePrerequisite(
    requiredCourseId: number,
    desiredCourseId: number,
  ) {
    const exists = await this.prereqRepo.findOne({
      where: { requiredCourseId, desiredCourseId },
    });
    if (!exists) {
      await this.prereqRepo.save({ requiredCourseId, desiredCourseId });
    }
  }

  private generateCoursesGraph(
    courses: Course[],
    prereqs: Prerequisite[],
  ): Map<string, string[]> {
    const graph = new Map<string, string[]>();

    // Initialize graph
    courses.forEach((c) => {
      graph.set(c.name, []);
    });

    // Add edges
    prereqs.forEach((p) => {
      const required = courses.find((c) => c.id === p.requiredCourseId);
      const desired = courses.find((c) => c.id === p.desiredCourseId);
      if (required && desired) {
        graph.get(required.name).push(desired.name);
      }
    });

    return graph;
  }
}
