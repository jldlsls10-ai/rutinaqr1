import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoutinesService } from './routines.service';
import { RoutinesController } from './routines.controller';
import { Routine } from '../common/entities/routine.entity';
import { RoutineAssignment } from '../common/entities/routine-assignment.entity';
import { Activity } from '../common/entities/activity.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Routine, RoutineAssignment, Activity])],
  controllers: [RoutinesController],
  providers: [RoutinesService],
  exports: [RoutinesService],
})
export class RoutinesModule {}
