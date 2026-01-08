import { Test, TestingModule } from '@nestjs/testing';
import { TaskStatus } from '@prisma/client';
import { CreateTaskDto } from '../dto/create-task.dto';
import { UpdateTaskDto } from '../dto/update-task.dto';
import { Task } from '../entities/task.entity';
import { TasksService } from '../services/tasks.service';
import { TasksController } from './tasks.controller';

describe('TasksController', () => {
  let controller: TasksController;

  const mockTask: Task = {
    id: 'task-uuid-1',
    title: 'Test Task',
    description: 'Test Description',
    status: TaskStatus.PENDING,
    userId: 'user-uuid-1',
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    deletedAt: null,
  };

  const mockTasksService = {
    create: jest.fn(),
    findByUserId: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    restore: jest.fn(),
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [
        {
          provide: TasksService,
          useValue: mockTasksService,
        },
      ],
    }).compile();

    controller = module.get<TasksController>(TasksController);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call tasksService.create with correct params', async () => {
      const userId = 'user-uuid-1';
      const createTaskDto: CreateTaskDto = {
        title: 'New Task',
        description: 'Task Description',
      };

      mockTasksService.create.mockResolvedValue(mockTask);

      const result = await controller.create(userId, createTaskDto);

      expect(mockTasksService.create).toHaveBeenCalledWith({
        userId,
        data: createTaskDto,
      });
      expect(result).toEqual(mockTask);
    });
  });

  describe('findAll', () => {
    it('should call tasksService.findByUserId with userId', async () => {
      const userId = 'user-uuid-1';
      const tasks = [mockTask];

      mockTasksService.findByUserId.mockResolvedValue(tasks);

      const result = await controller.findAll(userId);

      expect(mockTasksService.findByUserId).toHaveBeenCalledWith(userId);
      expect(result).toEqual(tasks);
    });
  });

  describe('findById', () => {
    it('should call tasksService.findOne with task id and userId', async () => {
      const taskId = 'task-uuid-1';
      const userId = 'user-uuid-1';

      mockTasksService.findOne.mockResolvedValue(mockTask);

      const result = await controller.findById(taskId, userId);

      expect(mockTasksService.findOne).toHaveBeenCalledWith(taskId, userId);
      expect(result).toEqual(mockTask);
    });
  });

  describe('update', () => {
    it('should call tasksService.update with correct params', async () => {
      const taskId = 'task-uuid-1';
      const userId = 'user-uuid-1';
      const updateTaskDto: UpdateTaskDto = {
        title: 'Updated Title',
        status: TaskStatus.COMPLETED,
      };
      const updatedTask = { ...mockTask, ...updateTaskDto };

      mockTasksService.update.mockResolvedValue(updatedTask);

      const result = await controller.update(taskId, userId, updateTaskDto);

      expect(mockTasksService.update).toHaveBeenCalledWith({
        id: taskId,
        userId,
        data: updateTaskDto,
      });
      expect(result).toEqual(updatedTask);
    });
  });

  describe('remove', () => {
    it('should call tasksService.remove with task id and userId', async () => {
      const taskId = 'task-uuid-1';
      const userId = 'user-uuid-1';
      const deletedTask = { ...mockTask, deletedAt: new Date() };

      mockTasksService.remove.mockResolvedValue(deletedTask);

      const result = await controller.remove(taskId, userId);

      expect(mockTasksService.remove).toHaveBeenCalledWith(taskId, userId);
      expect(result).toEqual(deletedTask);
    });
  });

  describe('restore', () => {
    it('should call tasksService.restore with task id and userId', async () => {
      const taskId = 'task-uuid-1';
      const userId = 'user-uuid-1';
      const restoredTask = { ...mockTask, deletedAt: null };

      mockTasksService.restore.mockResolvedValue(restoredTask);

      const result = await controller.restore(taskId, userId);

      expect(mockTasksService.restore).toHaveBeenCalledWith(taskId, userId);
      expect(result).toEqual(restoredTask);
    });
  });
});
