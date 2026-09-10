import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { IsEmail, IsString, MinLength, IsOptional, IsUUID } from 'class-validator';
import { AuthService } from './auth.service';

class RegisterCaregiverDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  @MinLength(2)
  displayName: string;
}

class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}

class PinLoginDto {
  @IsUUID()
  userId: string;

  @IsString()
  @MinLength(4)
  pin: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register-caregiver')
  async register(@Body() dto: RegisterCaregiverDto) {
    const data = await this.authService.registerCaregiver(
      dto.email,
      dto.password,
      dto.displayName,
    );
    return { success: true, data };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto) {
    const data = await this.authService.login(dto.email, dto.password);
    return { success: true, data };
  }

  @Post('user-pin-login')
  @HttpCode(HttpStatus.OK)
  async pinLogin(@Body() dto: PinLoginDto) {
    const data = await this.authService.loginWithPin(dto.userId, dto.pin);
    return { success: true, data };
  }
}
