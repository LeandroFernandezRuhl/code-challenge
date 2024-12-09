import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('prerequisites')
export class Prerequisite {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  requiredCourseId: number;

  @Column()
  desiredCourseId: number;
}
