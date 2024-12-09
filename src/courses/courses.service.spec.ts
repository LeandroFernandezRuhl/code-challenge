import { Test, TestingModule } from '@nestjs/testing';
import { CoursesService } from './courses.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// Mocking topologicalSort
jest.mock('../util/topological-sort.util', () => ({
  topologicalSort: jest.fn(),
}));
import { topologicalSort } from '../util/topological-sort.util';
import { Prerequisite } from './entities/prerequisite.entity';
import { Course } from './entities/course.entity';
import { CourseInput } from './dto/create-schedule.dto';

describe('CoursesService', () => {
  let service: CoursesService;
  let courseRepo: jest.Mocked<Repository<Course>>;
  let prereqRepo: jest.Mocked<Repository<Prerequisite>>;

  beforeEach(async () => {
    courseRepo = {
      find: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
      create: jest.fn(),
    } as any;

    prereqRepo = {
      find: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
      create: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CoursesService,
        {
          provide: getRepositoryToken(Course),
          useValue: courseRepo,
        },
        {
          provide: getRepositoryToken(Prerequisite),
          useValue: prereqRepo,
        },
      ],
    }).compile();

    service = module.get<CoursesService>(CoursesService);
  });

  describe('generateStudySchedule', () => {
    it('should create courses and prerequisites as needed and return topologically sorted order', async () => {
      const inputs: CourseInput[] = [
        { desiredCourse: 'CourseB', requiredCourse: 'CourseA' },
        { desiredCourse: 'CourseC', requiredCourse: 'CourseB' },
      ];

      // Mock behavior of courseRepo for createOrUpdateCourse
      const courseA = { id: 1, name: 'CourseA' } as Course;
      const courseB = { id: 2, name: 'CourseB' } as Course;
      const courseC = { id: 3, name: 'CourseC' } as Course;

      // Mock findOne so that the first time a course is requested, it's not found,
      // and we have to create it. Subsequent requests might find it.
      courseRepo.findOne.mockImplementation((options: any) => {
        const { name } = options.where as { name: string };
        if (name === 'CourseA') return Promise.resolve(undefined);
        if (name === 'CourseB') return Promise.resolve(undefined);
        if (name === 'CourseC') return Promise.resolve(undefined);
        return Promise.resolve(undefined);
      });

      // Mock create and save for courses
      courseRepo.create.mockImplementation((dto) => dto as Course);
      courseRepo.save.mockImplementation((course: Course) => {
        if (course.name === 'CourseA') return Promise.resolve(courseA);
        if (course.name === 'CourseB') return Promise.resolve(courseB);
        if (course.name === 'CourseC') return Promise.resolve(courseC);
        return Promise.resolve(course);
      });

      // Mock prereqRepo findOne and save for prerequisites
      prereqRepo.findOne.mockResolvedValue(undefined);
      prereqRepo.save.mockImplementation((p: Partial<Prerequisite>) =>
        Promise.resolve({
          requiredCourseId: p.requiredCourseId,
          desiredCourseId: p.desiredCourseId,
        } as Prerequisite),
      );

      // After all updates, generateCoursesGraph will call find on both repos:
      courseRepo.find.mockResolvedValue([courseA, courseB, courseC]);
      prereqRepo.find.mockResolvedValue([
        { requiredCourseId: 1, desiredCourseId: 2 } as Prerequisite,
        { requiredCourseId: 2, desiredCourseId: 3 } as Prerequisite,
      ]);

      // Mock topologicalSort
      (topologicalSort as jest.Mock).mockReturnValue([
        'CourseA',
        'CourseB',
        'CourseC',
      ]);

      const result = await service.generateStudySchedule(inputs);

      expect(courseRepo.findOne).toHaveBeenCalledTimes(3);
      expect(courseRepo.save).toHaveBeenCalledTimes(3); // A, B, C created
      expect(prereqRepo.save).toHaveBeenCalledTimes(2); // (A->B), (B->C)
      expect(prereqRepo.find).toHaveBeenCalled();
      expect(courseRepo.find).toHaveBeenCalled();
      expect(topologicalSort).toHaveBeenCalledWith(
        new Map([
          ['CourseA', ['CourseB']],
          ['CourseB', ['CourseC']],
          ['CourseC', []],
        ]),
      );
      expect(result).toEqual(['CourseA', 'CourseB', 'CourseC']);
    });

    it('should return an empty array if no inputs are provided', async () => {
      const inputs: CourseInput[] = [];

      // If no inputs, no updates are made, but it still calls find to build graph
      courseRepo.find.mockResolvedValue([]);
      prereqRepo.find.mockResolvedValue([]);
      (topologicalSort as jest.Mock).mockReturnValue([]);

      const result = await service.generateStudySchedule(inputs);

      expect(courseRepo.find).toHaveBeenCalled();
      expect(prereqRepo.find).toHaveBeenCalled();
      expect(topologicalSort).toHaveBeenCalledWith(new Map());
      expect(result).toEqual([]);
    });
  });
});
