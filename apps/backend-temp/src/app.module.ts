import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TasksModule } from './tasks/tasks.module';
import { EnterpriseModule } from './enterprise/enterprise.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (config) => {
        const jwtSecret = config.JWT_SECRET;
        if (typeof jwtSecret !== 'string' || jwtSecret.trim().length < 32) {
          throw new Error('JWT_SECRET must be set to at least 32 characters');
        }
        return config;
      },
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    TasksModule,
    EnterpriseModule,
  ],
})
export class AppModule {}
