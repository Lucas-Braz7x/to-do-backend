import { Injectable, NotFoundException } from '@nestjs/common';
import { TaskStatus } from '@prisma/client';
import { CreateTaskDto } from '../dto/create-task.dto';
import { UpdateTaskDto } from '../dto/update-task.dto';
import { Task } from '../entities/task.entity';
import { TaskRepository } from '../repositories/task.repository';

@Injectable()
export class TasksService {
  constructor(private readonly taskRepository: TaskRepository) {}

  async create({
    userId,
    data,
  }: {
    userId: string;
    data: CreateTaskDto;
  }): Promise<Task> {
    return this.taskRepository.create({
      title: data.title,
      description: data.description,
      status: data.status ?? TaskStatus.PENDING,
      user: {
        connect: { id: userId },
      },
    });
  }

  async findAll(): Promise<Task[]> {
    return this.taskRepository.findAll();
  }

  async findByUserId(userId: string): Promise<Task[]> {
    return this.taskRepository.findByUserId(userId);
  }

  async findOne(id: string): Promise<Task> {
    const task = await this.taskRepository.findById(id);
    if (!task) {
      throw new NotFoundException(`Tarefa com ID ${id} não encontrada`);
    }
    return task;
  }

  async update({
    id,
    data,
  }: {
    id: string;
    data: UpdateTaskDto;
  }): Promise<Task> {
    await this.findOne(id);
    return this.taskRepository.update({ id, data });
  }

  async remove(id: string): Promise<Task> {
    await this.findOne(id);
    return this.taskRepository.softDelete(id);
  }

  async restore(id: string): Promise<Task> {
    const task = await this.taskRepository.findByIdIncludingDeleted(id);
    if (!task) {
      throw new NotFoundException(`Tarefa com ID ${id} não encontrada`);
    }
    if (!task.deletedAt) {
      throw new NotFoundException(`Tarefa com ID ${id} não está deletada`);
    }
    return this.taskRepository.restore(id);
  }

  async findDeleted(userId: string): Promise<Task[]> {
    return this.taskRepository.findDeletedByUserId(userId);
  }
}
