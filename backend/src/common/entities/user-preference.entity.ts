import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('user_preferences')
export class UserPreference {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', unique: true })
  userId: string;

  @Column({ name: 'theme_primary_color', length: 9, default: '#1F4E79' })
  themePrimaryColor: string;

  @Column({ name: 'theme_background', length: 9, default: '#FFFFFF' })
  themeBackground: string;

  @Column({ name: 'font_scale', type: 'numeric', precision: 3, scale: 2, default: 1.0 })
  fontScale: number;

  @Column({ name: 'voice_enabled', default: true })
  voiceEnabled: boolean;

  @Column({ name: 'icon_only_mode', default: false })
  iconOnlyMode: boolean;

  @Column({ name: 'high_contrast', default: false })
  highContrast: boolean;

  @Column({ name: 'alarm_sound', length: 50, default: 'default' })
  alarmSound: string;

  @Column({ name: 'success_sound', length: 50, default: 'default' })
  successSound: string;

  @Column({ name: 'extra_settings', type: 'jsonb', default: {} })
  extraSettings: Record<string, any>;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @OneToOne(() => User, (user) => user.preferences, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
