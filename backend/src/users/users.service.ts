import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../common/entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly usersRepo: Repository<User>,
  ) {}

  async findById(id: string): Promise<User> {
    const user = await this.usersRepo.findOne({ where: { id, isActive: true } });
    if (!user) throw new NotFoundException('USER_NOT_FOUND');
    return user;
  }

  async updateLocale(id: string, locale: string) {
    await this.usersRepo.update(id, { locale });
    return this.findById(id);
  }
}
