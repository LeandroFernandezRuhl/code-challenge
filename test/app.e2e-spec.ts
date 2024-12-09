import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { CoursesModule } from '../src/courses/courses.module';
import { CoursesService } from '../src/courses/courses.service';
import { Course } from '../src/courses/entities/course.entity';
import { Prerequisite } from '../src/courses/entities/prerequisite.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthGuard } from '../src/guards/auth.guard';

describe('Courses', () => {
  let app: INestApplication;
  const coursesService = { generateStudySchedule: () => ['test'] };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [Course, Prerequisite],
          synchronize: true,
        }),
        CoursesModule,
      ],
    })
      .overrideProvider(CoursesService)
      .useValue(coursesService)
      .overrideGuard(AuthGuard)
      .useValue({
        canActivate: () => true,
      })
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  it(`/POST schedule`, () => {
    return request(app.getHttpServer())
      .post('/courses/schedule')
      .expect(201)
      .expect({
        schedule: coursesService.generateStudySchedule(),
      });
  });

  afterAll(async () => {
    await app.close();
  });
});
