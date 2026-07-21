import {
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
import { EnterpriseService } from './enterprise.service';
import { JwtGuard } from '../auth/jwt/jwt.guard';
import { PermissionsGuard } from '../auth/permissions/permissions.guard';
import { Permissions } from '../auth/permissions/permissions.decorator';

@UseGuards(JwtGuard)
@Controller('enterprise')
export class EnterpriseController {
  constructor(private readonly enterprise: EnterpriseService) {}

  // --- TEAMS ENDPOINTS ---
  @Get('teams')
  getTeams() {
    return this.enterprise.getTeams();
  }

  @Get('teams/my-team')
  getMyTeam(@Req() req) {
    const userId = req.user.id;
    // Find team where user is lead or a member
    const team = this.enterprise.getTeams().find(
      (t) => t.leadId === userId || t.memberIds.includes(userId),
    );
    return team || null;
  }

  @UseGuards(PermissionsGuard)
  @Permissions('projects.manage')
  @Post('teams')
  createTeam(@Body() body: { name: string; leadId: number; memberIds?: number[] }) {
    return this.enterprise.createTeam(body.name, body.leadId, body.memberIds || []);
  }

  @UseGuards(PermissionsGuard)
  @Permissions('projects.manage')
  @Delete('teams/:id')
  deleteTeam(@Param('id') id: string) {
    const success = this.enterprise.deleteTeam(Number(id));
    return { success };
  }

  @UseGuards(PermissionsGuard)
  @Permissions('projects.manage')
  @Patch('teams/:id/members')
  updateTeamMembers(@Param('id') id: string, @Body('memberIds') memberIds: number[]) {
    return this.enterprise.updateTeamMembers(Number(id), memberIds);
  }

  // --- PROJECTS ENDPOINTS ---
  @Get('projects')
  getProjects() {
    return this.enterprise.getProjects();
  }

  @UseGuards(PermissionsGuard)
  @Permissions('projects.manage')
  @Post('projects')
  createProject(@Body() body: { name: string; description: string }) {
    return this.enterprise.createProject(body.name, body.description);
  }

  @UseGuards(PermissionsGuard)
  @Permissions('projects.manage')
  @Delete('projects/:id')
  deleteProject(@Param('id') id: string) {
    const success = this.enterprise.deleteProject(Number(id));
    return { success };
  }

  // --- COMMENTS ENDPOINTS ---
  @Get('tasks/:taskId/comments')
  getComments(@Param('taskId') taskId: string) {
    return this.enterprise.getComments(Number(taskId));
  }

  @Post('tasks/:taskId/comments')
  addComment(
    @Param('taskId') taskId: string,
    @Req() req,
    @Body('content') content: string,
  ) {
    // Log comment activity
    this.enterprise.addActivityLog(
      req.user.id,
      req.user.email, // simple fallback
      'Comment Added',
      `User commented on task #${taskId}: "${content.substring(0, 30)}..."`,
    );

    return this.enterprise.addComment(
      Number(taskId),
      req.user.id,
      req.user.name || req.user.email,
      req.user.role,
      content,
    );
  }

  // --- ATTACHMENTS ENDPOINTS ---
  @Get('tasks/:taskId/attachments')
  getAttachments(@Param('taskId') taskId: string) {
    return this.enterprise.getAttachments(Number(taskId));
  }

  @Post('tasks/:taskId/attachments')
  addAttachment(
    @Param('taskId') taskId: string,
    @Req() req,
    @Body() body: { fileName: string; fileSize: string; fileUrl: string },
  ) {
    this.enterprise.addActivityLog(
      req.user.id,
      req.user.email,
      'Attachment Uploaded',
      `Uploaded file "${body.fileName}" on task #${taskId}`,
    );

    return this.enterprise.addAttachment(
      Number(taskId),
      req.user.id,
      body.fileName,
      body.fileSize,
      body.fileUrl,
    );
  }

  // --- TASK EXTENSION ENDPOINTS ---
  @Get('tasks/:taskId/extension')
  getTaskExtension(@Param('taskId') taskId: string) {
    return this.enterprise.getTaskExtension(Number(taskId));
  }

  @Patch('tasks/:taskId/extension')
  updateTaskExtension(
    @Param('taskId') taskId: string,
    @Body() ext: any,
  ) {
    return this.enterprise.updateTaskExtension(Number(taskId), ext);
  }

  // --- NOTIFICATIONS ENDPOINTS ---
  @Get('notifications')
  getNotifications(@Req() req) {
    return this.enterprise.getNotifications(req.user.id);
  }

  @Patch('notifications/:id/read')
  markNotificationAsRead(@Param('id') id: string) {
    const success = this.enterprise.markNotificationAsRead(Number(id));
    return { success };
  }

  @Post('notifications/read-all')
  markAllNotificationsAsRead(@Req() req) {
    this.enterprise.markAllNotificationsAsRead(req.user.id);
    return { success: true };
  }

  @Post('notifications/dispatch')
  dispatchNotification(
    @Body() body: { userId: number; title: string; message: string; type: string },
  ) {
    return this.enterprise.createNotification(body.userId, body.title, body.message, body.type);
  }

  // --- ACTIVITY LOGS ENDPOINTS ---
  @UseGuards(PermissionsGuard)
  @Permissions('reports.view')
  @Get('activity-logs')
  getActivityLogs() {
    return this.enterprise.getActivityLogs();
  }

  @Post('activity-logs')
  createActivityLog(
    @Req() req,
    @Body() body: { action: string; details: string },
  ) {
    return this.enterprise.addActivityLog(
      req.user.id,
      req.user.name || req.user.email,
      body.action,
      body.details,
    );
  }

  // --- SYSTEM SETTINGS ENDPOINTS ---
  @Get('settings')
  getSettings() {
    return this.enterprise.getSystemSettings();
  }

  @UseGuards(PermissionsGuard)
  @Permissions('settings.manage')
  @Patch('settings')
  updateSettings(@Body() settings: any) {
    return this.enterprise.updateSystemSettings(settings);
  }

  // --- DYNAMIC ROLES ARCHITECTURE ENDPOINTS ---
  @Get('roles')
  getRoles() {
    return this.enterprise.getRoles();
  }

  @UseGuards(PermissionsGuard)
  @Permissions('settings.manage')
  @Post('roles')
  createRole(@Body() body: { name: string; permissions: string[] }) {
    return this.enterprise.createRole(body.name, body.permissions);
  }

  @UseGuards(PermissionsGuard)
  @Permissions('settings.manage')
  @Patch('roles/:name')
  updateRole(@Param('name') name: string, @Body('permissions') permissions: string[]) {
    return this.enterprise.updateRolePermissions(name, permissions);
  }

  @UseGuards(PermissionsGuard)
  @Permissions('settings.manage')
  @Delete('roles/:name')
  deleteRole(@Param('name') name: string) {
    const success = this.enterprise.deleteRole(name);
    return { success };
  }
}
