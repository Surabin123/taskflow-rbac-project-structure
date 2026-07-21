import { Injectable, OnModuleInit } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export interface Team {
  id: number;
  name: string;
  leadId: number;
  memberIds: number[];
}

export interface Project {
  id: number;
  name: string;
  description: string;
}

export interface Comment {
  id: number;
  taskId: number;
  userId: number;
  userName: string;
  userRole: string;
  content: string;
  createdAt: string;
}

export interface Attachment {
  id: number;
  taskId: number;
  userId: number;
  fileName: string;
  fileSize: string;
  fileUrl: string;
  createdAt: string;
}

export interface TaskExtension {
  dueDate?: string;
  projectId?: number;
  category?: string;
  checklist: { id: string; text: string; completed: boolean }[];
}

export interface Notification {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
}

export interface ActivityLog {
  id: number;
  userId: number;
  userName: string;
  action: string;
  details: string;
  createdAt: string;
}

export interface UserExtension {
  phone?: string;
  department?: string;
  profilePicture?: string;
  isSuspended: boolean;
}

export interface SystemSettings {
  allowRoleSelectionOnRegister: boolean;
  categories: string[];
  priorities: string[];
  statuses: string[];
}

@Injectable()
export class EnterpriseService implements OnModuleInit {
  private filePath = path.join(__dirname, '..', '..', 'prisma', 'enterprise-db.json');
  private data: {
    teams: Team[];
    projects: Project[];
    comments: Record<number, Comment[]>;
    attachments: Record<number, Attachment[]>;
    taskExtensions: Record<number, TaskExtension>;
    notifications: Notification[];
    activityLogs: ActivityLog[];
    userExtensions: Record<number, UserExtension>;
    systemSettings: SystemSettings;
    roles: Record<string, string[]>;
  } = {
    teams: [],
    projects: [],
    comments: {},
    attachments: {},
    taskExtensions: {},
    notifications: [],
    activityLogs: [],
    userExtensions: {},
    systemSettings: {
      allowRoleSelectionOnRegister: true,
      categories: ['Frontend', 'Backend', 'Design', 'QA', 'Management', 'Operations'],
      priorities: ['LOW', 'MEDIUM', 'HIGH'],
      statuses: ['TODO', 'IN_PROGRESS', 'DONE'],
    },
    roles: {},
  };

  onModuleInit() {
    this.loadData();
  }

  private loadData() {
    try {
      const dir = path.dirname(this.filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      if (fs.existsSync(this.filePath)) {
        const fileContent = fs.readFileSync(this.filePath, 'utf-8');
        this.data = { ...this.data, ...JSON.parse(fileContent) };
      } else {
        this.seedInitialData();
        this.saveData();
      }
    } catch (error) {
      console.error('Failed to load enterprise DB JSON:', error);
    }
  }

  private saveData() {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (error) {
      console.error('Failed to save enterprise DB JSON:', error);
    }
  }

  private seedInitialData() {
    // Initial Teams
    this.data.teams = [
      { id: 1, name: 'Product Engineering', leadId: 1, memberIds: [2] },
      { id: 2, name: 'Infrastructure & DevOps', leadId: 1, memberIds: [] },
    ];

    // Initial Projects
    this.data.projects = [
      { id: 1, name: 'Core Platform v3', description: 'Enterprise redesign and RBAC enforcement.' },
      { id: 2, name: 'Security Audit & Compliance', description: 'End-to-end audit for HIPAA/SOC2 compliance.' },
    ];

    // Seed task details mapping
    this.data.taskExtensions[1] = {
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      projectId: 1,
      category: 'Backend',
      checklist: [
        { id: 'c1', text: 'Audit JWT validation filters', completed: true },
        { id: 'c2', text: 'Configure secure HTTP-Only cookie flags', completed: true },
        { id: 'c3', text: 'Setup cross-site redirect guards', completed: false },
      ],
    };

    this.data.taskExtensions[2] = {
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      projectId: 1,
      category: 'Design',
      checklist: [
        { id: 'c4', text: 'Design new landing center page layout', completed: true },
        { id: 'c5', text: 'Design modern layout view with standard sidebars', completed: false },
        { id: 'c6', text: 'Add skeleton loader components', completed: false },
      ],
    };

    this.data.taskExtensions[3] = {
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      projectId: 2,
      category: 'QA',
      checklist: [
        { id: 'c7', text: 'Test unauthorized routing constraints', completed: false },
        { id: 'c8', text: 'Validate session cookie expiration triggers', completed: false },
      ],
    };

    // Initial Activity Logs
    this.data.activityLogs = [
      {
        id: 1,
        userId: 1,
        userName: 'System Admin',
        action: 'System Seeded',
        details: 'Initial system seeding completed with sample users and configurations.',
        createdAt: new Date().toISOString(),
      },
    ];

    // Seed User Extra details
    this.data.userExtensions[1] = {
      phone: '+1 555-0100',
      department: 'Executive Administration',
      profilePicture: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=128&h=128&fit=crop',
      isSuspended: false,
    };
    this.data.userExtensions[2] = {
      phone: '+1 555-0144',
      department: 'Engineering leadership',
      profilePicture: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=128&h=128&fit=crop',
      isSuspended: false,
    };
    this.data.userExtensions[3] = {
      phone: '+1 555-0182',
      department: 'Product Engineering',
      profilePicture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=128&h=128&fit=crop',
      isSuspended: false,
    };
  }

  // --- TEAMS APIS ---
  getTeams(): Team[] {
    return this.data.teams;
  }

  getTeam(id: number): Team | undefined {
    return this.data.teams.find((t) => t.id === id);
  }

  createTeam(name: string, leadId: number, memberIds: number[]): Team {
    const id = this.data.teams.length > 0 ? Math.max(...this.data.teams.map((t) => t.id)) + 1 : 1;
    const newTeam: Team = { id, name, leadId, memberIds };
    this.data.teams.push(newTeam);
    this.saveData();
    return newTeam;
  }

  deleteTeam(id: number): boolean {
    const index = this.data.teams.findIndex((t) => t.id === id);
    if (index !== -1) {
      this.data.teams.splice(index, 1);
      this.saveData();
      return true;
    }
    return false;
  }

  updateTeamMembers(teamId: number, memberIds: number[]): Team | undefined {
    const team = this.getTeam(teamId);
    if (team) {
      team.memberIds = memberIds;
      this.saveData();
      return team;
    }
    return undefined;
  }

  // --- PROJECTS APIS ---
  getProjects(): Project[] {
    return this.data.projects;
  }

  getProject(id: number): Project | undefined {
    return this.data.projects.find((p) => p.id === id);
  }

  createProject(name: string, description: string): Project {
    const id = this.data.projects.length > 0 ? Math.max(...this.data.projects.map((p) => p.id)) + 1 : 1;
    const newProject: Project = { id, name, description };
    this.data.projects.push(newProject);
    this.saveData();
    return newProject;
  }

  deleteProject(id: number): boolean {
    const index = this.data.projects.findIndex((p) => p.id === id);
    if (index !== -1) {
      this.data.projects.splice(index, 1);
      this.saveData();
      return true;
    }
    return false;
  }

  // --- COMMENTS APIS ---
  getComments(taskId: number): Comment[] {
    return this.data.comments[taskId] || [];
  }

  addComment(taskId: number, userId: number, userName: string, userRole: string, content: string): Comment {
    if (!this.data.comments[taskId]) {
      this.data.comments[taskId] = [];
    }
    const id = Date.now();
    const comment: Comment = {
      id,
      taskId,
      userId,
      userName,
      userRole,
      content,
      createdAt: new Date().toISOString(),
    };
    this.data.comments[taskId].push(comment);
    this.saveData();
    return comment;
  }

  // --- ATTACHMENTS APIS ---
  getAttachments(taskId: number): Attachment[] {
    return this.data.attachments[taskId] || [];
  }

  addAttachment(taskId: number, userId: number, fileName: string, fileSize: string, fileUrl: string): Attachment {
    if (!this.data.attachments[taskId]) {
      this.data.attachments[taskId] = [];
    }
    const id = Date.now();
    const attachment: Attachment = {
      id,
      taskId,
      userId,
      fileName,
      fileSize,
      fileUrl,
      createdAt: new Date().toISOString(),
    };
    this.data.attachments[taskId].push(attachment);
    this.saveData();
    return attachment;
  }

  // --- TASK EXTENSIONS APIS ---
  getTaskExtension(taskId: number): TaskExtension {
    if (!this.data.taskExtensions[taskId]) {
      this.data.taskExtensions[taskId] = { checklist: [] };
    }
    return this.data.taskExtensions[taskId];
  }

  updateTaskExtension(taskId: number, ext: Partial<TaskExtension>): TaskExtension {
    const current = this.getTaskExtension(taskId);
    this.data.taskExtensions[taskId] = { ...current, ...ext };
    this.saveData();
    return this.data.taskExtensions[taskId];
  }

  // --- NOTIFICATIONS APIS ---
  getNotifications(userId: number): Notification[] {
    return this.data.notifications.filter((n) => n.userId === userId);
  }

  createNotification(userId: number, title: string, message: string, type: string): Notification {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    const notification: Notification = {
      id,
      userId,
      title,
      message,
      type,
      read: false,
      createdAt: new Date().toISOString(),
    };
    this.data.notifications.unshift(notification);
    const userNotes = this.data.notifications.filter((n) => n.userId === userId);
    if (userNotes.length > 100) {
      const oldestToRemove = userNotes.slice(100);
      this.data.notifications = this.data.notifications.filter((n) => !oldestToRemove.includes(n));
    }
    this.saveData();
    return notification;
  }

  markNotificationAsRead(id: number): boolean {
    const index = this.data.notifications.findIndex((n) => n.id === id);
    if (index !== -1) {
      this.data.notifications[index].read = true;
      this.saveData();
      return true;
    }
    return false;
  }

  markAllNotificationsAsRead(userId: number) {
    this.data.notifications.forEach((n) => {
      if (n.userId === userId) n.read = true;
    });
    this.saveData();
  }

  // --- ACTIVITY LOGS APIS ---
  getActivityLogs(): ActivityLog[] {
    return this.data.activityLogs;
  }

  addActivityLog(userId: number, userName: string, action: string, details: string): ActivityLog {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    const log: ActivityLog = {
      id,
      userId,
      userName,
      action,
      details,
      createdAt: new Date().toISOString(),
    };
    this.data.activityLogs.unshift(log);
    if (this.data.activityLogs.length > 500) {
      this.data.activityLogs.pop();
    }
    this.saveData();
    return log;
  }

  // --- USER EXTENSIONS APIS ---
  getUserExtension(userId: number): UserExtension {
    if (!this.data.userExtensions[userId]) {
      this.data.userExtensions[userId] = { isSuspended: false };
    }
    return this.data.userExtensions[userId];
  }

  updateUserExtension(userId: number, ext: Partial<UserExtension>): UserExtension {
    const current = this.getUserExtension(userId);
    this.data.userExtensions[userId] = { ...current, ...ext };
    this.saveData();
    return this.data.userExtensions[userId];
  }

  isUserSuspended(userId: number): boolean {
    return this.getUserExtension(userId).isSuspended === true;
  }

  // --- SYSTEM SETTINGS APIS ---
  getSystemSettings(): SystemSettings {
    return this.data.systemSettings;
  }

  updateSystemSettings(settings: Partial<SystemSettings>): SystemSettings {
    this.data.systemSettings = { ...this.data.systemSettings, ...settings };
    this.saveData();
    return this.data.systemSettings;
  }

  // --- ROLES & PERMISSIONS APIS ---
  getRoles(): Record<string, string[]> {
    if (!this.data.roles || Object.keys(this.data.roles).length === 0) {
      this.data.roles = {
        ADMIN: [
          "users.create", "users.edit", "users.delete",
          "tasks.create", "tasks.edit", "tasks.delete",
          "projects.manage", "reports.view", "settings.manage"
        ],
        EMPLOYEE: [
          "tasks.edit"
        ]
      };
      this.saveData();
    }
    return this.data.roles;
  }

  createRole(name: string, permissions: string[]): Record<string, string[]> {
    const roles = this.getRoles();
    const normalized = name.toUpperCase().trim();
    roles[normalized] = permissions;
    this.saveData();
    return roles;
  }

  updateRolePermissions(name: string, permissions: string[]): Record<string, string[]> {
    const roles = this.getRoles();
    const normalized = name.toUpperCase().trim();
    if (roles[normalized]) {
      roles[normalized] = permissions;
      this.saveData();
    }
    return roles;
  }

  deleteRole(name: string): boolean {
    const roles = this.getRoles();
    const normalized = name.toUpperCase().trim();
    if (normalized === 'ADMIN' || normalized === 'EMPLOYEE') {
      return false; // prevent deleting standard roles
    }
    if (roles[normalized]) {
      delete roles[normalized];
      this.saveData();
      return true;
    }
    return false;
  }

  getRolePermissions(role: string): string[] {
    const roles = this.getRoles();
    const normalized = (role || 'EMPLOYEE').toUpperCase().trim();
    if (normalized === 'ADMIN') {
      return [
        "users.create", "users.edit", "users.delete",
        "tasks.create", "tasks.edit", "tasks.delete",
        "projects.manage", "reports.view", "settings.manage"
      ];
    }
    return roles[normalized] || [];
  }
}
