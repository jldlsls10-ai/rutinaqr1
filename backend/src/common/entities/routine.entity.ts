import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Activity } from './activity.entity';
import { RoutineAssignment } from './routine-assignment.entity';

@Entity('routines')
export class Routine {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'owner_caregiver_id' })
  ownerCaregiverId: string;

  @Column({ length: 150 })
  name: string;

  /** 1=Lunes … 7=Domingo */
  @Column({ name: 'days_of_week', type: 'smallint', array: true, default: [1, 2, 3, 4, 5, 6, 7] })
  daysOfWeek: number[];

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt: Date | null;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'owner_caregiver_id' })
  owner: User;

  @OneToMany(() => Activity, (activity) => activity.routine)
  activities: Activity[];

  @OneToMany(() => RoutineAssignment, (assignment) => assignment.routine)
  assignments: RoutineAssignment[];
}
