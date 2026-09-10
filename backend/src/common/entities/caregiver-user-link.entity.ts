import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { User } from './user.entity';

export enum LinkStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  REVOKED = 'revoked',
}

@Entity('caregiver_user_links')
@Unique(['caregiverId', 'userId'])
export class CaregiverUserLink {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'caregiver_id' })
  caregiverId: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ type: 'jsonb', default: { edit_routines: true, view_history: true, manage_preferences: true } })
  permissions: Record<string, boolean>;

  @Column({ type: 'enum', enum: LinkStatus, default: LinkStatus.PENDING })
  status: LinkStatus;

 @Column({ type: 'varchar', name: 'invitation_code', length: 12, unique: true, nullable: true })
  invitationCode: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.caregiverLinks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'caregiver_id' })
  caregiver: User;

  @ManyToOne(() => User, (user) => user.userLinks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
