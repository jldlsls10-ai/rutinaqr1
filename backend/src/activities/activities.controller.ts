import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Req,
  Res,
  Header,
} from '@nestjs/common';
import { Response } from 'express';
import { IsString, IsOptional, IsInt, Min, IsUUID } from 'class-validator';
import { ActivitiesService } from './activities.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User } from '../common/entities/user.entity';

class CreateActivityDto {
  @IsString()
  name: string;

  @IsString()
  scheduledTime: string; // "08:30:00"

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  instructions?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  orderIndex?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  graceMinutes?: number;
}

class ValidateScanDto {
  @IsString()
  qrPayload: string;

  @IsOptional()
  @IsUUID()
  activityId?: string;
}

@Controller()
@UseGuards(JwtAuthGuard)
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @Post('routines/:routineId/activities')
  async create(
    @Req() req: { user: User },
    @Param('routineId') routineId: string,
    @Body() dto: CreateActivityDto,
  ) {
    const data = await this.activitiesService.create(routineId, req.user.id, dto);
    return { success: true, data };
  }

  @Get('activities/:id/qr')
  async getQr(@Param('id') id: string, @Res() res: Response) {
    const buffer = await this.activitiesService.getQrImage(id);
    res.set({ 'Content-Type': 'image/png' });
    res.send(buffer);
  }

  @Post('activities/:id/regenerate-qr')
  async regenerate(@Req() req: { user: User }, @Param('id') id: string) {
    const data = await this.activitiesService.regenerateQr(id, req.user.id);
    return { success: true, data };
  }

  @Post('scan/validate')
  async validate(@Body() dto: ValidateScanDto) {
    const result = await this.activitiesService.validateScan(dto.qrPayload, dto.activityId);
    return { success: true, data: result };
  }
}
