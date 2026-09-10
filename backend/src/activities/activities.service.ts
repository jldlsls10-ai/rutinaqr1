import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Activity } from '../common/entities/activity.entity';
import { Routine } from '../common/entities/routine.entity';
import { QrService } from '../common/qr.service';

@Injectable()
export class ActivitiesService {
  constructor(
    @InjectRepository(Activity) private readonly activitiesRepo: Repository<Activity>,
    @InjectRepository(Routine) private readonly routinesRepo: Repository<Routine>,
    private readonly qrService: QrService,
  ) {}

  async create(
    routineId: string,
    caregiverId: string,
    data: {
      name: string;
      scheduledTime: string;
      imageUrl?: string;
      audioUrl?: string;
      instructions?: string;
      orderIndex?: number;
      graceMinutes?: number;
    },
  ) {
    const routine = await this.routinesRepo.findOne({ where: { id: routineId } });
    if (!routine) throw new NotFoundException('ROUTINE_NOT_FOUND');
    if (routine.ownerCaregiverId !== caregiverId) throw new ForbiddenException();

    const activity = this.activitiesRepo.create({
      routineId,
      name: data.name,
      scheduledTime: data.scheduledTime,
      imageUrl: data.imageUrl ?? null,
      audioUrl: data.audioUrl ?? null,
      instructions: data.instructions ?? null,
      orderIndex: data.orderIndex ?? 0,
      graceMinutes: data.graceMinutes ?? 10,
    });
    await this.activitiesRepo.save(activity);

    // Generar QR firmado inmediatamente
    const { full, payload, signature } = this.qrService.generateSignedPayload(activity.id);
    activity.qrPayload = full;
    activity.qrSignature = signature;
    await this.activitiesRepo.save(activity);

    return activity;
  }

  async regenerateQr(activityId: string, caregiverId: string) {
    const activity = await this.activitiesRepo.findOne({
      where: { id: activityId },
      relations: ['routine'],
    });
    if (!activity) throw new NotFoundException('ACTIVITY_NOT_FOUND');
    if (activity.routine.ownerCaregiverId !== caregiverId) throw new ForbiddenException();

    const { full, signature } = this.qrService.generateSignedPayload(activity.id);
    activity.qrPayload = full;
    activity.qrSignature = signature;
    await this.activitiesRepo.save(activity);
    return activity;
  }

  async getQrImage(activityId: string): Promise<Buffer> {
    const activity = await this.activitiesRepo.findOne({ where: { id: activityId } });
    if (!activity || !activity.qrPayload) throw new NotFoundException('QR_NOT_FOUND');
    return this.qrService.generateQrImage(activity.qrPayload);
  }

  async validateScan(fullQr: string, expectedActivityId?: string) {
    const result = this.qrService.validate(fullQr);
    if (!result.valid) return result;
    if (expectedActivityId && result.activityId !== expectedActivityId) {
      return { valid: false, reason: 'WRONG_ACTIVITY' };
    }
    return result;
  }
}
