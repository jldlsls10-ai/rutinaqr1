import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { IsOptional, IsString, MinLength } from 'class-validator';
import { LinksService } from './links.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User } from '../common/entities/user.entity';

class CreateInviteDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  displayName?: string;
}

class AcceptInviteDto {
  @IsString()
  @MinLength(6)
  code: string;

  @IsOptional()
  @IsString()
  pin?: string;
}

@Controller('links')
@UseGuards(JwtAuthGuard)
export class LinksController {
  constructor(private readonly linksService: LinksService) {}

  @Post('invite')
  async invite(@Req() req: { user: User }, @Body() dto: CreateInviteDto) {
    const data = await this.linksService.createInvitation(req.user.id, dto.displayName);
    return { success: true, data };
  }

  @Post('accept')
  async accept(@Body() dto: AcceptInviteDto) {
    const data = await this.linksService.acceptInvitation(dto.code, dto.pin);
    return { success: true, data };
  }

  @Get()
  async list(@Req() req: { user: User }) {
    if (req.user.role === 'caregiver') {
      const data = await this.linksService.listForCaregiver(req.user.id);
      return { success: true, data };
    }
    const data = await this.linksService.listForUser(req.user.id);
    return { success: true, data };
  }

  @Delete(':id')
  async revoke(@Req() req: { user: User }, @Param('id') id: string) {
    await this.linksService.revoke(id, req.user.id);
    return { success: true };
  }
}
