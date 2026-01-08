import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { CreateTaskDto } from '../dto/create-task.dto';
import { UpdateTaskDto } from '../dto/update-task.dto';
import { Task } from '../entities/task.entity';
import { TasksService } from '../services/tasks.service';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  async create(
    @CurrentUser('id') userId: string,
    @Body() data: CreateTaskDto,
  ): Promise<Task> {
    const task = await this.tasksService.create({ userId, data });
    return task;
  }

  @Get()
  async findAll(@CurrentUser('id') userId: string): Promise<Task[]> {
    const tasks = await this.tasksService.findByUserId(userId);
    return tasks;
  }

  @Get(':id')
  async findById(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ): Promise<Task> {
    const task = await this.tasksService.findOne(id, userId);
    return task;
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() data: UpdateTaskDto,
  ): Promise<Task> {
    const task = await this.tasksService.update({ id, userId, data });
    return task;
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ): Promise<Task> {
    const task = await this.tasksService.remove(id, userId);
    return task;
  }

  @Patch(':id/restore')
  async restore(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ): Promise<Task> {
    const task = await this.tasksService.restore(id, userId);
    return task;
  }
}
