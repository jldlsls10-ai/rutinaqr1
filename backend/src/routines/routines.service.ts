import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Routine } from '../common/entities/routine.entity';
import { RoutineAssignment } from '../common/entities/routine-assignment.entity';

@Injectable()
export class RoutinesService {
  constructor(
    @InjectRepository(Routine) private readonly routinesRepo: Repository<Routine>,
    @InjectRepository(RoutineAssignment)
    private readonly assignmentsRepo: Repository<RoutineAssignment>,
  ) {}

  async create(caregiverId: string, name: string, daysOfWeek: number[]) {
    const routine = this.routinesRepo.create({
      ownerCaregiverId: caregiverId,
      name,
      daysOfWeek,
    });
    return this.routinesRepo.save(routine);
  }

  async findAllForCaregiver(caregiverId: string) {
    return this.routinesRepo.find({
      where: { ownerCaregiverId: caregiverId, isActive: true },
      relations: ['activities'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, caregiverId?: string) {
    const routine = await this.routinesRepo.findOne({
      where: { id },
      relations: ['activities'],
      order: { activities: { orderIndex: 'ASC' } } as any,
    });
    if (!routine) throw new NotFoundException('ROUTINE_NOT_FOUND');
    if (caregiverId && routine.ownerCaregiverId !== caregiverId) {
      throw new ForbiddenException();
    }
    return routine;
  }

  async assignToUsers(routineId: string, userIds: string[], caregiverId: string) {
    const routine = await this.findOne(routineId, caregiverId);
    const existing = await this.assignmentsRepo.find({ where: { routineId } });
    const existingUserIds = new Set(existing.map((e) => e.userId));

    const toCreate = userIds
      .filter((uid) => !existingUserIds.has(uid))
      .map((userId) => this.assignmentsRepo.create({ routineId, userId }));

    if (toCreate.length) await this.assignmentsRepo.save(toCreate);
    return { assigned: toCreate.length };
  }

  /** Rutina del día para un usuario (actividades + estado) */
  async getTodayForUser(userId: string) {
    const todayDow = new Date().getDay(); // 0=Dom … 6=Sáb → convertir a 1=Lun…7=Dom
    const isoDow = todayDow === 0 ? 7 : todayDow;

    const assignments = await this.assignmentsRepo.find({
      where: { userId },
      relations: ['routine', 'routine.activities'],
    });

    const active = assignments.filter(
      (a) =>
        a.routine.isActive &&
        a.routine.daysOfWeek.includes(isoDow),
    );

    return active.map((a) => ({
      routineId: a.routine.id,
      routineName: a.routine.name,
      activities: (a.routine.activities || [])
        .filter((act) => act.isActive)
        .sort((x, y) => x.orderIndex - y.orderIndex),
    }));
  }
}
