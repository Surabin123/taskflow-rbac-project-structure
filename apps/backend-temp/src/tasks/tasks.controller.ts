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
} from '@nestjs/common';

import { TasksService } from './tasks.service';
import { JwtGuard } from '../auth/jwt/jwt.guard';
import { PermissionsGuard } from '../auth/permissions/permissions.guard';
import { Permissions } from '../auth/permissions/permissions.decorator';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasks: TasksService) {}

  @UseGuards(JwtGuard, PermissionsGuard)
  @Permissions('tasks.create')
  @Post()
  create(@Body() body: any, @Req() req) {
    return this.tasks.create(body, req.user.id);
  }

  @UseGuards(JwtGuard)
  @Get()
  getAll(@Req() req) {
    return this.tasks.findAll(req.user);
  }

  @UseGuards(JwtGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() body: any,
    @Req() req,
  ) {
    const hasFullEdit = req.user.role === 'ADMIN' || req.user.permissions?.includes('tasks.edit');
    if (!hasFullEdit) {
      const keys = Object.keys(body);
      const isInvalid = keys.some((k) => k !== 'status');
      if (isInvalid) {
        throw new BadRequestException(
          'Employees are only authorized to update task status.',
        );
      }
    }
    return this.tasks.update(Number(id), body);
  }

  @UseGuards(JwtGuard, PermissionsGuard)
  @Permissions('tasks.delete')
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.tasks.delete(Number(id));
  }
}