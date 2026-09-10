import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActivityCompletion, CompletionStatus } from '../common/entities/activity-completion.entity';

@Injectable()
export class CompletionsService {
  constructor(
    @InjectRepository(ActivityCompletion)
    private readonly completionsRepo: Repository<ActivityCompletion>,
  ) {}

  async markCompleted(
    activityId: string,
    userId: string,
    scannedQrValid: boolean,
    deviceInfo?: Record<string, any>,
  ) {
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

    let completion = await this.completionsRepo.findOne({
      where: { activityId, userId, scheduledFor: today },
    });

    if (!completion) {
      completion = this.completionsRepo.create({
        activityId,
        userId,
        scheduledFor: today,
      });
    }

    completion.completedAt = new Date();
    completion.status = CompletionStatus.COMPLETED;
    completion.scannedQrValid = scannedQrValid;
    completion.deviceInfo = deviceInfo ?? null;

    return this.completionsRepo.save(completion);
  }

  async getTodayForUser(userId: string) {
    const today = new Date().toISOString().slice(0, 10);
    return this.completionsRepo.find({
      where: { userId, scheduledFor: today },
      relations: ['activity'],
    });
  }
}
