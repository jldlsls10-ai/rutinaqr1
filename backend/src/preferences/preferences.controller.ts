import { Controller, Get, Patch, Body, Param, UseGuards, Req } from '@nestjs/common';
import { IsOptional, IsBoolean, IsNumber, IsString, Min, Max } from 'class-validator';
import { PreferencesService } from './preferences.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User } from '../common/entities/user.entity';

class UpdatePrefsDto {
  @IsOptional() @IsString() themePrimaryColor?: string;
  @IsOptional() @IsString() themeBackground?: string;
  @IsOptional() @IsNumber() @Min(1) @Max(1.8) fontScale?: number;
  @IsOptional() @IsBoolean() voiceEnabled?: boolean;
  @IsOptional() @IsBoolean() iconOnlyMode?: boolean;
  @IsOptional() @IsBoolean() highContrast?: boolean;
}

@Controller('preferences')
@UseGuards(JwtAuthGuard)
export class PreferencesController {
  constructor(private readonly prefsService: PreferencesService) {}

  @Get(':userId')
  async get(@Param('userId') userId: string) {
    const data = await this.prefsService.getOrCreate(userId);
    return { success: true, data };
  }

  @Patch(':userId')
  async update(@Param('userId') userId: string, @Body() dto: UpdatePrefsDto) {
    const data = await this.prefsService.update(userId, dto);
    return { success: true, data };
  }
}
