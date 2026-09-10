import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Activity } from './activity.entity';
import { User } from './user.entity';

export enum CompletionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  LATE = 'late',
  MISSED = 'missed',
}

@Entity('activity_completions')
@Unique(['activityId', 'userId', 'scheduledFor'])
export class ActivityCompletion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'activity_id' })
  activityId: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'scheduled_for', type: 'date' })
  scheduledFor: string; // YYYY-MM-DD

  @Column({ name: 'completed_at', type: 'timestamptz', nullable: true })
  completedAt: Date | null;

  @Column({ type: 'enum', enum: CompletionStatus, default: CompletionStatus.PENDING })
  status: CompletionStatus;

  @Column({ name: 'scanned_qr_valid', type: 'boolean', nullable: true })
  scannedQrValid: boolean | null;

  @Column({ name: 'device_info', type: 'jsonb', nullable: true })
  deviceInfo: Record<string, any> | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @ManyToOne(() => Activity, (a) => a.completions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'activity_id' })
  activity: Activity;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
