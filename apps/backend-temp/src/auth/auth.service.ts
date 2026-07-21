import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { EnterpriseService } from '../enterprise/enterprise.service';

@Injectable()
export class AuthService {
  private resetTokens = new Map<string, { email: string; expires: number }>();

  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private enterprise: EnterpriseService,
  ) {}

  async register(dto: RegisterDto) {
    const userExists = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (userExists) {
      throw new BadRequestException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        password: hashedPassword,
        role: dto.role,
      },
    });

    // Create default user extensions for new user
    this.enterprise.updateUserExtension(user.id, {
      isSuspended: false,
      department: 'General Staff',
      phone: '',
      profilePicture: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=128&h=128&fit=crop',
    });

    this.enterprise.addActivityLog(
      user.id,
      user.name,
      'User Registered',
      `Registered new account as role: ${user.role}`,
    );

    // Remove password before sending response
    const { password, ...userData } = user;

    return {
      message: 'User Registered Successfully',
      user: userData,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid Email');
    }

    if (this.enterprise.isUserSuspended(user.id)) {
      throw new UnauthorizedException('Your account has been suspended by the administrator.');
    }

    const valid = await bcrypt.compare(dto.password, user.password);

    if (!valid) {
      throw new UnauthorizedException('Invalid Password');
    }

    const token = this.jwt.sign({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    this.enterprise.addActivityLog(
      user.id,
      user.name,
      'User Logged In',
      `Logged in successfully. Session active.`,
    );

    // Remove password before sending response
    const { password, ...userData } = user;

    const ext = this.enterprise.getUserExtension(user.id);

    return {
      message: 'Login Successful',
      access_token: token,
      user: {
        ...userData,
        phone: ext.phone,
        department: ext.department,
        profilePicture: ext.profilePicture,
        isSuspended: ext.isSuspended,
      },
    };
  }

  async getUserProfile(userId: number) {
    if (this.enterprise.isUserSuspended(userId)) {
      throw new UnauthorizedException('User account is suspended');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        managerId: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const ext = this.enterprise.getUserExtension(userId);

    return {
      ...user,
      phone: ext.phone,
      department: ext.department,
      profilePicture: ext.profilePicture,
      isSuspended: ext.isSuspended,
    };
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new BadRequestException('User with this email does not exist.');
    }

    const token = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit numerical token
    this.resetTokens.set(token, {
      email,
      expires: Date.now() + 15 * 60 * 1000, // 15 mins
    });

    this.enterprise.addActivityLog(
      user.id,
      user.name,
      'Password Reset Requested',
      `Requested a password recovery email reset token.`,
    );

    return {
      message: 'Password reset token generated successfully. In production, this would be sent to your email.',
      token, // return token directly for seamless client-side verification testing
    };
  }

  async resetPassword(token: string, passwordNew: string) {
    const record = this.resetTokens.get(token);
    if (!record) {
      throw new BadRequestException('Invalid recovery reset token.');
    }

    if (Date.now() > record.expires) {
      this.resetTokens.delete(token);
      throw new BadRequestException('Reset token has expired. Please request a new one.');
    }

    const user = await this.prisma.user.findUnique({
      where: { email: record.email },
    });

    if (!user) {
      throw new BadRequestException('User not found.');
    }

    const hashedPassword = await bcrypt.hash(passwordNew, 10);
    await this.prisma.user.update({
      where: { email: record.email },
      data: { password: hashedPassword },
    });

    this.resetTokens.delete(token);

    this.enterprise.addActivityLog(
      user.id,
      user.name,
      'Password Reset Completed',
      `Successfully updated password using recovery token.`,
    );

    return {
      message: 'Password reset successful. You can now login with your new password.',
    };
  }
}