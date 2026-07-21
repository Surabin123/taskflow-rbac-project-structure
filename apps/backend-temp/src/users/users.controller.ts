import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtGuard } from '../auth/jwt/jwt.guard';
import { PermissionsGuard } from '../auth/permissions/permissions.guard';
import { Permissions } from '../auth/permissions/permissions.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtGuard)
  @Get('profile')
  profile(@Req() req) {
    return {
      message: 'Welcome',
      user: req.user,
    };
  }

  @UseGuards(JwtGuard)
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @UseGuards(JwtGuard, PermissionsGuard)
  @Permissions('users.create')
  @Post()
  create(@Body() body: any) {
    return this.usersService.create(body);
  }

  @UseGuards(JwtGuard, PermissionsGuard)
  @Permissions('users.edit')
  @Patch(':id/role')
  updateRole(@Param('id') id: string, @Body('role') role: string) {
    return this.usersService.updateRole(Number(id), role);
  }

  @UseGuards(JwtGuard, PermissionsGuard)
  @Permissions('users.delete')
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.usersService.delete(Number(id));
  }

  @UseGuards(JwtGuard, PermissionsGuard)
  @Permissions('users.edit')
  @Patch(':id/suspend')
  suspend(@Param('id') id: string) {
    return this.usersService.suspend(Number(id));
  }

  @UseGuards(JwtGuard, PermissionsGuard)
  @Permissions('users.edit')
  @Patch(':id/activate')
  activate(@Param('id') id: string) {
    return this.usersService.activate(Number(id));
  }

  @UseGuards(JwtGuard, PermissionsGuard)
  @Permissions('users.edit')
  @Patch(':id/manager')
  updateManager(@Param('id') id: string, @Body('managerId') managerId: any) {
    return this.usersService.updateManager(Number(id), managerId);
  }

  @UseGuards(JwtGuard)
  @Patch(':id/profile')
  updateProfile(
    @Param('id') id: string,
    @Req() req,
    @Body() body: any,
  ) {
    // Standard validation: users can only modify their own profile unless they are admin
    if (req.user.id !== Number(id) && req.user.role !== 'ADMIN') {
      throw new BadRequestException('Unauthorized profile modification attempt');
    }
    return this.usersService.updateProfile(Number(id), body);
  }

  @UseGuards(JwtGuard)
  @Patch(':id/password')
  updatePassword(
    @Param('id') id: string,
    @Req() req,
    @Body() body: any,
  ) {
    if (req.user.id !== Number(id)) {
      throw new BadRequestException('Unauthorized password modification attempt');
    }
    return this.usersService.updatePassword(Number(id), body.oldPassword, body.newPassword);
  }
}
