import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Routine } from './routine.entity';
import { User } from './user.entity';

@Entity('routine_assignments')
@Unique(['routineId', 'userId'])
export class RoutineAssignment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'routine_id' })
  routineId: string;

  @Column({ name: 'user_id' })
  userId: string;

  @CreateDateColumn({ name: 'assigned_at', type: 'timestamptz' })
  assignedAt: Date;

  @ManyToOne(() => Routine, (r) => r.assignments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'routine_id' })
  routine: Routine;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
