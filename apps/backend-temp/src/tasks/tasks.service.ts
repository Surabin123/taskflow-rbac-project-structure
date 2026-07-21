import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EnterpriseService } from '../enterprise/enterprise.service';

@Injectable()
export class TasksService {
  constructor(
    private prisma: PrismaService,
    private enterprise: EnterpriseService,
  ) {}

  async create(data: any, creatorId: number) {
    const task = await this.prisma.task.create({
      data: {
        title: data.title,
        description: data.description || '',
        status: data.status || 'TODO',
        priority: data.priority || 'MEDIUM',
        assignedToId: Number(data.assignedToId),
        assignedById: Number(data.assignedById || creatorId),
      },
      include: {
        assignedTo: { select: { id: true, name: true, email: true, role: true } },
        assignedBy: { select: { id: true, name: true, email: true, role: true } },
      },
    });

    const ext: any = {};
    if (data.dueDate) ext.dueDate = data.dueDate;
    if (data.projectId) ext.projectId = Number(data.projectId);
    if (data.category) ext.category = data.category;
    if (data.checklist) ext.checklist = data.checklist;
    this.enterprise.updateTaskExtension(task.id, ext);

    this.enterprise.createNotification(
      task.assignedToId,
      'New Task Assigned',
      `You have been assigned a new task: "${task.title}"`,
      'task_assigned',
    );

    this.enterprise.addActivityLog(
      creatorId,
      task.assignedBy?.name || 'System',
      'Task Assigned',
      `Assigned task "${task.title}" to user ${task.assignedTo?.name || '#' + task.assignedToId}`,
    );

    const extra = this.enterprise.getTaskExtension(task.id);
    return { ...task, ...extra };
  }

  async findAll(user?: any) {
    let whereClause = {};

    if (user && user.role !== 'ADMIN') {
      whereClause = { assignedToId: user.id };
    }

    const tasks = await this.prisma.task.findMany({
      where: whereClause,
      include: {
        assignedTo: { select: { id: true, name: true, email: true, role: true } },
        assignedBy: { select: { id: true, name: true, email: true, role: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return tasks.map((t) => {
      const extra = this.enterprise.getTaskExtension(t.id);
      return { ...t, ...extra };
    });
  }

  async update(id: number, data: any) {
    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.assignedToId !== undefined) updateData.assignedToId = Number(data.assignedToId);

    const taskBefore = await this.prisma.task.findUnique({ where: { id } });

    const task = await this.prisma.task.update({
      where: { id },
      data: updateData,
      include: {
        assignedTo: { select: { id: true, name: true, email: true, role: true } },
        assignedBy: { select: { id: true, name: true, email: true, role: true } },
      },
    });

    const extUpdate: any = {};
    if (data.dueDate !== undefined) extUpdate.dueDate = data.dueDate;
    if (data.projectId !== undefined) extUpdate.projectId = data.projectId ? Number(data.projectId) : null;
    if (data.category !== undefined) extUpdate.category = data.category;
    if (data.checklist !== undefined) extUpdate.checklist = data.checklist;

    if (Object.keys(extUpdate).length > 0) {
      this.enterprise.updateTaskExtension(id, extUpdate);
    }

    if (data.status && data.status !== taskBefore?.status) {
      this.enterprise.addActivityLog(
        task.assignedToId,
        task.assignedTo?.name || 'User',
        'Status Changed',
        `Changed task #${id} status from ${taskBefore?.status} to ${data.status}`,
      );

      if (data.status === 'DONE') {
        this.enterprise.createNotification(
          task.assignedById,
          'Task Completed',
          `Task "${task.title}" has been completed by ${task.assignedTo?.name}`,
          'task_completed',
        );
      }
    }

    const extra = this.enterprise.getTaskExtension(task.id);
    return { ...task, ...extra };
  }

  async delete(id: number) {
    return this.prisma.task.delete({
      where: { id },
    });
  }
}