import { Controller, Post, Get, Body, UseGuards, Req } from '@nestjs/common';
import { IsUUID, IsBoolean, IsOptional } from 'class-validator';
import { CompletionsService } from './completions.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User } from '../common/entities/user.entity';

class MarkCompletedDto {
  @IsUUID()
  activityId: string;

  @IsBoolean()
  scannedQrValid: boolean;
}

@Controller('completions')
@UseGuards(JwtAuthGuard)
export class CompletionsController {
  constructor(private readonly completionsService: CompletionsService) {}

  @Post()
  async mark(@Req() req: { user: User }, @Body() dto: MarkCompletedDto) {
    const data = await this.completionsService.markCompleted(
      dto.activityId,
      req.user.id,
      dto.scannedQrValid,
    );
    return { success: true, data };
  }

  @Get('today')
  async today(@Req() req: { user: User }) {
    const data = await this.completionsService.getTodayForUser(req.user.id);
    return { success: true, data };
  }
}
