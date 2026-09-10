import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivitiesService } from './activities.service';
import { ActivitiesController } from './activities.controller';
import { Activity } from '../common/entities/activity.entity';
import { Routine } from '../common/entities/routine.entity';
import { QrService } from '../common/qr.service';
import { CompletionsModule } from '../completions/completions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Activity, Routine]),
    CompletionsModule,
  ],
  controllers: [ActivitiesController],
  providers: [ActivitiesService, QrService],
  exports: [ActivitiesService, QrService],
})
export class ActivitiesModule {}
