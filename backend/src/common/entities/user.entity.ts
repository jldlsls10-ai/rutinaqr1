import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { CaregiverUserLink } from './caregiver-user-link.entity';
import { UserPreference } from './user-preference.entity';
import { DeviceToken } from './device-token.entity';

export enum UserRole {
  CAREGIVER = 'caregiver',
  USER = 'user',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'citext', unique: true, nullable: true })
  email: string | null;

  @Column({ name: 'password_hash', nullable: true })
  passwordHash: string | null;

  @Column({ type: 'enum', enum: UserRole })
  role: UserRole;

  @Column({ name: 'display_name', length: 120 })
  displayName: string;

  @Column({ name: 'avatar_url', type: 'text', nullable: true })
  avatarUrl: string | null;

  @Column({ length: 10, default: 'es' })
  locale: string;

  @Column({ name: 'pin_hash', nullable: true })
  pinHash: string | null;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt: Date | null;

  // Relations
  @OneToMany(() => CaregiverUserLink, (link) => link.caregiver)
  caregiverLinks: CaregiverUserLink[];

  @OneToMany(() => CaregiverUserLink, (link) => link.user)
  userLinks: CaregiverUserLink[];

  @OneToOne(() => UserPreference, (pref) => pref.user)
  preferences: UserPreference;

  @OneToMany(() => DeviceToken, (token) => token.user)
  deviceTokens: DeviceToken[];
}
