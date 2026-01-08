import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { CreateTaskDto } from '../dto/create-task.dto';
import { UpdateTaskDto } from '../dto/update-task.dto';
import { Task } from '../entities/task.entity';
import { TasksService } from '../services/tasks.service';

@ApiTags('tasks')
@ApiBearerAuth('JWT-auth')
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @ApiOperation({ summary: 'Criar nova tarefa' })
  @ApiResponse({
    status: 201,
    description: 'Tarefa criada com sucesso',
    type: Task,
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  async create(
    @CurrentUser('id') userId: string,
    @Body() data: CreateTaskDto,
  ): Promise<Task> {
    const task = await this.tasksService.create({ userId, data });
    return task;
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as tarefas do usuário' })
  @ApiResponse({ status: 200, description: 'Lista de tarefas', type: [Task] })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  async findAll(@CurrentUser('id') userId: string): Promise<Task[]> {
    const tasks = await this.tasksService.findByUserId(userId);
    return tasks;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar tarefa por ID' })
  @ApiParam({ name: 'id', description: 'ID da tarefa' })
  @ApiResponse({ status: 200, description: 'Tarefa encontrada', type: Task })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 404, description: 'Tarefa não encontrada' })
  async findById(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ): Promise<Task> {
    const task = await this.tasksService.findOne(id, userId);
    return task;
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar tarefa' })
  @ApiParam({ name: 'id', description: 'ID da tarefa' })
  @ApiResponse({ status: 200, description: 'Tarefa atualizada', type: Task })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 404, description: 'Tarefa não encontrada' })
  async update(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() data: UpdateTaskDto,
  ): Promise<Task> {
    const task = await this.tasksService.update({ id, userId, data });
    return task;
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover tarefa (soft delete)' })
  @ApiParam({ name: 'id', description: 'ID da tarefa' })
  @ApiResponse({ status: 200, description: 'Tarefa removida', type: Task })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 404, description: 'Tarefa não encontrada' })
  async remove(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ): Promise<Task> {
    const task = await this.tasksService.remove(id, userId);
    return task;
  }

  @Patch(':id/restore')
  @ApiOperation({ summary: 'Restaurar tarefa removida' })
  @ApiParam({ name: 'id', description: 'ID da tarefa' })
  @ApiResponse({ status: 200, description: 'Tarefa restaurada', type: Task })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 404, description: 'Tarefa não encontrada' })
  async restore(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ): Promise<Task> {
    const task = await this.tasksService.restore(id, userId);
    return task;
  }
}
