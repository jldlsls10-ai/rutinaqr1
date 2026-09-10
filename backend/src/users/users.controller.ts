import { Controller, Get, Patch, Body, UseGuards, Req } from '@nestjs/common';
import { IsIn } from 'class-validator';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User } from '../common/entities/user.entity';

class UpdateLocaleDto {
  @IsIn(['es', 'en'])
  locale: string;
}

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async me(@Req() req: { user: User }) {
    return { success: true, data: req.user };
  }

  @Patch('me/locale')
  async updateLocale(@Req() req: { user: User }, @Body() dto: UpdateLocaleDto) {
    const data = await this.usersService.updateLocale(req.user.id, dto.locale);
    return { success: true, data };
  }
}
