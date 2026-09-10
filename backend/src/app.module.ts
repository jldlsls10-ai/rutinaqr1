import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { LinksModule } from './links/links.module';
import { RoutinesModule } from './routines/routines.module';
import { ActivitiesModule } from './activities/activities.module';
import { CompletionsModule } from './completions/completions.module';
import { PreferencesModule } from './preferences/preferences.module';
import { RealtimeModule } from './realtime/realtime.module';

@Module({
  imports: [
  TypeOrmModule.forRoot({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'rutinaqr',
  password: process.env.DB_PASSWORD || 'change_me',
  database: process.env.DB_DATABASE || 'rutinaqr',
  autoLoadEntities: true,
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
  ssl: process.env.DB_HOST?.includes('neon.tech')
    ? { rejectUnauthorized: false }
    : false,
}),
    AuthModule,
    UsersModule,
    LinksModule,
    RoutinesModule,
    ActivitiesModule,
    CompletionsModule,
    PreferencesModule,
    RealtimeModule,
  ],
})
export class AppModule {}
