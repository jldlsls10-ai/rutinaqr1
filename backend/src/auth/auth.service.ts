import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../common/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly usersRepo: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async registerCaregiver(email: string, password: string, displayName: string) {
    const existing = await this.usersRepo.findOne({ where: { email } });
    if (existing) throw new ConflictException('EMAIL_ALREADY_EXISTS');

    const passwordHash = await bcrypt.hash(password, 12);
    const user = this.usersRepo.create({
      email,
      passwordHash,
      role: UserRole.CAREGIVER,
      displayName,
      locale: 'es',
    });
    await this.usersRepo.save(user);

    return this.buildAuthResponse(user);
  }

  async login(email: string, password: string) {
    const user = await this.usersRepo.findOne({ where: { email, isActive: true } });
    if (!user || !user.passwordHash) throw new UnauthorizedException('INVALID_CREDENTIALS');

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('INVALID_CREDENTIALS');

    return this.buildAuthResponse(user);
  }

  /** Login simplificado para el modo Usuario (PIN) */
  async loginWithPin(userId: string, pin: string) {
    const user = await this.usersRepo.findOne({
      where: { id: userId, role: UserRole.USER, isActive: true },
    });
    if (!user || !user.pinHash) throw new UnauthorizedException('INVALID_PIN');

    const ok = await bcrypt.compare(pin, user.pinHash);
    if (!ok) throw new UnauthorizedException('INVALID_PIN');

    return this.buildAuthResponse(user);
  }

  async createUserAccount(
    displayName: string,
    pin?: string,
    locale = 'es',
  ): Promise<User> {
    const pinHash = pin ? await bcrypt.hash(pin, 12) : null;
    const user = this.usersRepo.create({
      role: UserRole.USER,
      displayName,
      pinHash,
      locale,
      email: null,
      passwordHash: null,
    });
    return this.usersRepo.save(user);
  }

  private buildAuthResponse(user: User) {
    const payload = { sub: user.id, role: user.role, email: user.email };
    const accessToken = this.jwtService.sign(payload);

    // En producción: generar y guardar refresh token hasheado
    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET || 'dev_refresh_secret',
      expiresIn: process.env.JWT_REFRESH_EXPIRES || '30d',
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        displayName: user.displayName,
        locale: user.locale,
        avatarUrl: user.avatarUrl,
      },
    };
  }

  async validateUserById(id: string): Promise<User | null> {
    return this.usersRepo.findOne({ where: { id, isActive: true } });
  }
}
