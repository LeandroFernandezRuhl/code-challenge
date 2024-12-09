export class CourseInput {
  desiredCourse: string;
  requiredCourse: string;
}

export class CreateScheduleDto {
  courses: CourseInput[];
}
