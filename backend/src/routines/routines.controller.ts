import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { IsString, IsArray, IsInt, ArrayMinSize, Min, Max } from 'class-validator';
import { RoutinesService } from './routines.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User } from '../common/entities/user.entity';

class CreateRoutineDto {
  @IsString()
  name: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsInt({ each: true })
  @Min(1, { each: true })
  @Max(7, { each: true })
  daysOfWeek: number[];
}

class AssignDto {
  @IsArray()
  @ArrayMinSize(1)
  userIds: string[];
}

@Controller('routines')
@UseGuards(JwtAuthGuard)
export class RoutinesController {
  constructor(private readonly routinesService: RoutinesService) {}

  @Post()
  async create(@Req() req: { user: User }, @Body() dto: CreateRoutineDto) {
    const data = await this.routinesService.create(
      req.user.id,
      dto.name,
      dto.daysOfWeek,
    );
    return { success: true, data };
  }

  @Get()
  async list(@Req() req: { user: User }) {
    if (req.user.role === 'caregiver') {
      const data = await this.routinesService.findAllForCaregiver(req.user.id);
      return { success: true, data };
    }
    // Usuario: devolver rutina de hoy
    const data = await this.routinesService.getTodayForUser(req.user.id);
    return { success: true, data };
  }

  @Get(':id')
  async one(@Req() req: { user: User }, @Param('id') id: string) {
    const data = await this.routinesService.findOne(id, req.user.id);
    return { success: true, data };
  }

  @Post(':id/assign')
  async assign(
    @Req() req: { user: User },
    @Param('id') id: string,
    @Body() dto: AssignDto,
  ) {
    const data = await this.routinesService.assignToUsers(
      id,
      dto.userIds,
      req.user.id,
    );
    return { success: true, data };
  }

  @Get('user/today')
  async today(@Req() req: { user: User }) {
    const data = await this.routinesService.getTodayForUser(req.user.id);
    return { success: true, data };
  }
}
