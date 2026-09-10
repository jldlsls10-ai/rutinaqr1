import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompletionsService } from './completions.service';
import { CompletionsController } from './completions.controller';
import { ActivityCompletion } from '../common/entities/activity-completion.entity';
import { Activity } from '../common/entities/activity.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ActivityCompletion, Activity])],
  controllers: [CompletionsController],
  providers: [CompletionsService],
  exports: [CompletionsService],
})
export class CompletionsModule {}
