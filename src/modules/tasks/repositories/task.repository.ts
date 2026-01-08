import { Injectable } from '@nestjs/common';
import { Prisma, TaskStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/services/prisma.service';
import { Task } from '../entities/task.entity';

@Injectable()
export class TaskRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.TaskCreateInput): Promise<Task> {
    return this.prisma.client.task.create({
      data,
    });
  }

  async findAll(): Promise<Task[]> {
    return this.prisma.client.task.findMany({
      where: { deletedAt: null },
    });
  }

  async findByUserId(userId: string): Promise<Task[]> {
    return this.prisma.client.task.findMany({
      where: { userId, deletedAt: null },
    });
  }

  async findById(id: string): Promise<Task | null> {
    return this.prisma.client.task.findFirst({
      where: { id, deletedAt: null },
    });
  }

  async findByIdAndUserId(id: string, userId: string): Promise<Task | null> {
    return this.prisma.client.task.findFirst({
      where: { id, userId, deletedAt: null },
    });
  }

  async findByIdIncludingDeleted(id: string): Promise<Task | null> {
    return this.prisma.client.task.findUnique({
      where: { id },
    });
  }

  async findByIdAndUserIdIncludingDeleted(
    id: string,
    userId: string,
  ): Promise<Task | null> {
    return this.prisma.client.task.findFirst({
      where: { id, userId },
    });
  }

  async update({
    id,
    data,
  }: {
    id: string;
    data: Prisma.TaskUpdateInput;
  }): Promise<Task> {
    return this.prisma.client.task.update({
      where: { id },
      data,
    });
  }

  async softDelete(id: string): Promise<Task> {
    return this.prisma.client.task.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async restore(id: string): Promise<Task> {
    return this.prisma.client.task.update({
      where: { id },
      data: { deletedAt: null },
    });
  }

  async hardDelete(id: string): Promise<Task> {
    return this.prisma.client.task.delete({
      where: { id },
    });
  }

  async exists(id: string): Promise<boolean> {
    const task = await this.prisma.client.task.findFirst({
      where: { id, deletedAt: null },
      select: { id: true },
    });
    return !!task;
  }

  async findByStatus(status: TaskStatus): Promise<Task[]> {
    return this.prisma.client.task.findMany({
      where: { status, deletedAt: null },
    });
  }

  async findByUserIdAndStatus(
    userId: string,
    status: TaskStatus,
  ): Promise<Task[]> {
    return this.prisma.client.task.findMany({
      where: {
        userId,
        status,
        deletedAt: null,
      },
    });
  }

  async findDeletedByUserId(userId: string): Promise<Task[]> {
    return this.prisma.client.task.findMany({
      where: {
        userId,
        deletedAt: { not: null },
      },
    });
  }
}
