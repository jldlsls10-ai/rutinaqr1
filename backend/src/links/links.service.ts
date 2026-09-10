import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import { CaregiverUserLink, LinkStatus } from '../common/entities/caregiver-user-link.entity';
import { User, UserRole } from '../common/entities/user.entity';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class LinksService {
  constructor(
    @InjectRepository(CaregiverUserLink)
    private readonly linksRepo: Repository<CaregiverUserLink>,
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
    private readonly authService: AuthService,
  ) {}

  /** Cuidador genera invitación (crea usuario vacío + link pending o solo código) */
  async createInvitation(caregiverId: string, displayName?: string) {
    const caregiver = await this.usersRepo.findOne({
      where: { id: caregiverId, role: UserRole.CAREGIVER },
    });
    if (!caregiver) throw new ForbiddenException('NOT_CAREGIVER');

    // Crear cuenta de Usuario mínima
    const user = await this.authService.createUserAccount(
      displayName || 'Usuario',
      undefined,
      caregiver.locale,
    );

    const invitationCode = crypto.randomBytes(4).toString('hex').toUpperCase(); // 8 chars

    const link = this.linksRepo.create({
      caregiverId,
      userId: user.id,
      status: LinkStatus.PENDING,
      invitationCode,
      permissions: {
        edit_routines: true,
        view_history: true,
        manage_preferences: true,
      },
    });
    await this.linksRepo.save(link);

    return {
      linkId: link.id,
      userId: user.id,
      invitationCode,
      displayName: user.displayName,
    };
  }

  /** Aceptar invitación (activa el link) */
  async acceptInvitation(code: string, optionalPin?: string) {
    const link = await this.linksRepo.findOne({
      where: { invitationCode: code.toUpperCase(), status: LinkStatus.PENDING },
      relations: ['user'],
    });
    if (!link) throw new NotFoundException('INVALID_OR_EXPIRED_CODE');

    link.status = LinkStatus.ACTIVE;
    link.invitationCode = null; // invalidar código
    await this.linksRepo.save(link);

    if (optionalPin && link.user) {
      // se podría actualizar el PIN aquí
    }

    return {
      linkId: link.id,
      userId: link.userId,
      caregiverId: link.caregiverId,
      status: link.status,
    };
  }

  async listForCaregiver(caregiverId: string) {
    return this.linksRepo.find({
      where: { caregiverId, status: LinkStatus.ACTIVE },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async listForUser(userId: string) {
    return this.linksRepo.find({
      where: { userId, status: LinkStatus.ACTIVE },
      relations: ['caregiver'],
    });
  }

  async revoke(linkId: string, requesterId: string) {
    const link = await this.linksRepo.findOne({ where: { id: linkId } });
    if (!link) throw new NotFoundException('LINK_NOT_FOUND');
    if (link.caregiverId !== requesterId && link.userId !== requesterId) {
      throw new ForbiddenException('NOT_ALLOWED');
    }
    link.status = LinkStatus.REVOKED;
    await this.linksRepo.save(link);
    return { success: true };
  }
}
