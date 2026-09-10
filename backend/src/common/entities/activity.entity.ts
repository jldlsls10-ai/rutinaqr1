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
import { Routine } from './routine.entity';
import { ActivityCompletion } from './activity-completion.entity';

@Entity('activities')
export class Activity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'routine_id' })
  routineId: string;

  @Column({ length: 150 })
  name: string;

  @Column({ name: 'scheduled_time', type: 'time' })
  scheduledTime: string; // 'HH:MM:SS'

  @Column({ name: 'image_url', type: 'text', nullable: true })
  imageUrl: string | null;

  @Column({ name: 'audio_url', type: 'text', nullable: true })
  audioUrl: string | null;

  @Column({ type: 'text', nullable: true })
  instructions: string | null;

  @Column({ name: 'order_index', default: 0 })
  orderIndex: number;

  @Column({ name: 'qr_payload', type: 'text', nullable: true })
  qrPayload: string | null;

@Column({ type: 'varchar', name: 'qr_signature', nullable: true })
qrSignature: string | null;

  @Column({ name: 'grace_minutes', default: 10 })
  graceMinutes: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt: Date | null;

  @ManyToOne(() => Routine, (routine) => routine.activities, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'routine_id' })
  routine: Routine;

  @OneToMany(() => ActivityCompletion, (c) => c.activity)
  completions: ActivityCompletion[];
}
