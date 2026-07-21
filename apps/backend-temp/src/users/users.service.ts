import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { EnterpriseService } from '../enterprise/enterprise.service';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private enterprise: EnterpriseService,
  ) {}

  async findAll() {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        managerId: true,
        createdAt: true,
      },
      orderBy: { id: 'asc' },
    });

    return users.map((u) => {
      const ext = this.enterprise.getUserExtension(u.id);
      return {
        ...u,
        phone: ext.phone || '',
        department: ext.department || '',
        profilePicture: ext.profilePicture || '',
        isSuspended: ext.isSuspended || false,
      };
    });
  }

  async create(data: { name: string; email: string; password?: string; role: any }) {
    const existing = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existing) {
      throw new BadRequestException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(data.password || 'password123', 10);

    const user = await this.prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: data.role,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    this.enterprise.updateUserExtension(user.id, {
      isSuspended: false,
      department: 'General Staff',
      phone: '',
      profilePicture: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=128&h=128&fit=crop',
    });

    return user;
  }

  async updateRole(id: number, role: any) {
    return this.prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });
  }

  async delete(id: number) {
    // Also cleanup assigned/created tasks if needed or set null
    await this.prisma.task.deleteMany({
      where: {
        OR: [{ assignedToId: id }, { assignedById: id }],
      },
    });

    return this.prisma.user.delete({
      where: { id },
    });
  }

  async suspend(id: number) {
    return this.enterprise.updateUserExtension(id, { isSuspended: true });
  }

  async activate(id: number) {
    return this.enterprise.updateUserExtension(id, { isSuspended: false });
  }

  async updateManager(id: number, managerId: number | null) {
    return this.prisma.user.update({
      where: { id },
      data: { managerId: managerId ? Number(managerId) : null },
      select: { id: true, name: true, email: true, role: true, managerId: true },
    });
  }

  async updateProfile(id: number, data: any) {
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.email !== undefined) updateData.email = data.email;

    const user = await this.prisma.user.update({
      where: { id },
      data: updateData,
    });

    const extUpdate: any = {};
    if (data.phone !== undefined) extUpdate.phone = data.phone;
    if (data.department !== undefined) extUpdate.department = data.department;
    if (data.profilePicture !== undefined) extUpdate.profilePicture = data.profilePicture;

    if (Object.keys(extUpdate).length > 0) {
      this.enterprise.updateUserExtension(id, extUpdate);
    }

    return this.prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, role: true, managerId: true },
    });
  }

  async updatePassword(id: number, oldPass: string, newPass: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new BadRequestException('User not found');

    const valid = await bcrypt.compare(oldPass, user.password);
    if (!valid) throw new BadRequestException('Current password input is incorrect');

    const hashed = await bcrypt.hash(newPass, 10);
    await this.prisma.user.update({
      where: { id },
      data: { password: hashed },
    });

    return { message: 'Password updated successfully' };
  }
}
