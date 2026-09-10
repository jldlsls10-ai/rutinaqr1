import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserPreference } from '../common/entities/user-preference.entity';

@Injectable()
export class PreferencesService {
  constructor(
    @InjectRepository(UserPreference)
    private readonly prefsRepo: Repository<UserPreference>,
  ) {}

  async getOrCreate(userId: string): Promise<UserPreference> {
    let pref = await this.prefsRepo.findOne({ where: { userId } });
    if (!pref) {
      pref = this.prefsRepo.create({ userId });
      await this.prefsRepo.save(pref);
    }
    return pref;
  }

  async update(userId: string, partial: Partial<UserPreference>) {
    const pref = await this.getOrCreate(userId);
    Object.assign(pref, partial);
    return this.prefsRepo.save(pref);
  }
}
