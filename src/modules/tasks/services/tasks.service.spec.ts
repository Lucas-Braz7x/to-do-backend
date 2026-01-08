import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TaskStatus } from '@prisma/client';
import { prismaTest } from '../../../../test/setup/prisma-test.service';
import { PrismaService } from '../../prisma/services/prisma.service';
import { CreateTaskDto } from '../dto/create-task.dto';
import { UpdateTaskDto } from '../dto/update-task.dto';
import { TaskRepository } from '../repositories/task.repository';
import { TasksService } from './tasks.service';

describe('TasksService', () => {
  let service: TasksService;
  let testUserId: string;

  // PrismaService mock that uses prismaTest
  const mockPrismaService = {
    client: prismaTest,
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        TaskRepository,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
  });

  beforeEach(async () => {
    // Clean the database before each test
    await prismaTest.cleanDatabase();

    // Create a test user
    const testUser = await prismaTest.user.create({
      data: {
        email: 'test@example.com',
        name: 'Test User',
        password: 'hashed_password',
      },
    });
    testUserId = testUser.id;
  });

  afterAll(async () => {
    await prismaTest.cleanDatabase();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a task with default PENDING status', async () => {
      const createTaskDto: CreateTaskDto = {
        title: 'New Task',
        description: 'Task description',
      };

      const result = await service.create({
        userId: testUserId,
        data: createTaskDto,
      });

      expect(result).toMatchObject({
        title: createTaskDto.title,
        description: createTaskDto.description,
        status: TaskStatus.PENDING,
        userId: testUserId,
        deletedAt: null,
      });
      expect(result.id).toBeDefined();
    });

    it('should create a task with specified status', async () => {
      const createTaskDto: CreateTaskDto = {
        title: 'New Task',
        description: 'Task description',
        status: TaskStatus.IN_PROGRESS,
      };

      const result = await service.create({
        userId: testUserId,
        data: createTaskDto,
      });

      expect(result).toMatchObject({
        title: createTaskDto.title,
        description: createTaskDto.description,
        status: TaskStatus.IN_PROGRESS,
        userId: testUserId,
      });
    });
  });

  describe('findAll', () => {
    it('should return all tasks', async () => {
      // Create two tasks
      await service.create({
        userId: testUserId,
        data: { title: 'Task 1', description: 'Desc 1' },
      });
      await service.create({
        userId: testUserId,
        data: { title: 'Task 2', description: 'Desc 2' },
      });

      const result = await service.findAll();

      expect(result).toHaveLength(2);
      expect(result).toMatchObject([
        { title: 'Task 1', description: 'Desc 1' },
        { title: 'Task 2', description: 'Desc 2' },
      ]);
    });

    it('should return empty array when there are no tasks', async () => {
      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findByUserId', () => {
    it('should return tasks for the specified user', async () => {
      // Create a task for the test user
      await service.create({
        userId: testUserId,
        data: { title: 'User Task', description: 'Desc' },
      });

      // Create another user with another task
      const otherUser = await prismaTest.user.create({
        data: {
          email: 'other@example.com',
          name: 'Other User',
          password: 'hashed_password',
        },
      });
      await service.create({
        userId: otherUser.id,
        data: { title: 'Other Task', description: 'Desc' },
      });

      const result = await service.findByUserId(testUserId);

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        title: 'User Task',
        userId: testUserId,
      });
    });

    it('should return empty array when user has no tasks', async () => {
      const result = await service.findByUserId(testUserId);

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a task by ID and userId', async () => {
      const createdTask = await service.create({
        userId: testUserId,
        data: { title: 'Task to Find', description: 'Desc' },
      });

      const result = await service.findOne(createdTask.id, testUserId);

      expect(result).toMatchObject({
        id: createdTask.id,
        title: 'Task to Find',
        description: 'Desc',
      });
    });

    it('should throw NotFoundException when task does not exist', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';

      await expect(service.findOne(nonExistentId, testUserId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findOne(nonExistentId, testUserId)).rejects.toThrow(
        `Tarefa com ID ${nonExistentId} não encontrada`,
      );
    });

    it('should throw NotFoundException when task belongs to another user', async () => {
      const createdTask = await service.create({
        userId: testUserId,
        data: { title: 'Task to Find', description: 'Desc' },
      });

      const otherUserId = '00000000-0000-0000-0000-000000000001';

      await expect(
        service.findOne(createdTask.id, otherUserId),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update an existing task', async () => {
      const createdTask = await service.create({
        userId: testUserId,
        data: { title: 'Original Task', description: 'Original Desc' },
      });

      const updateTaskDto: UpdateTaskDto = {
        title: 'Updated Title',
        status: TaskStatus.COMPLETED,
      };

      const result = await service.update({
        id: createdTask.id,
        userId: testUserId,
        data: updateTaskDto,
      });

      expect(result).toMatchObject({
        title: 'Updated Title',
        status: TaskStatus.COMPLETED,
        description: 'Original Desc', // Not changed
      });
    });

    it('should throw NotFoundException when task does not exist', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';
      const updateTaskDto: UpdateTaskDto = { title: 'Updated Title' };

      await expect(
        service.update({
          id: nonExistentId,
          userId: testUserId,
          data: updateTaskDto,
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when task belongs to another user', async () => {
      const createdTask = await service.create({
        userId: testUserId,
        data: { title: 'Original Task', description: 'Original Desc' },
      });

      const otherUserId = '00000000-0000-0000-0000-000000000001';
      const updateTaskDto: UpdateTaskDto = { title: 'Updated Title' };

      await expect(
        service.update({
          id: createdTask.id,
          userId: otherUserId,
          data: updateTaskDto,
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should soft delete an existing task', async () => {
      const createdTask = await service.create({
        userId: testUserId,
        data: { title: 'Task to Delete', description: 'Desc' },
      });

      const result = await service.remove(createdTask.id, testUserId);

      expect(result).toMatchObject({
        id: createdTask.id,
        title: 'Task to Delete',
      });
      expect(result.deletedAt).not.toBeNull();

      // Verify it no longer appears in normal searches
      await expect(service.findOne(createdTask.id, testUserId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException when task does not exist', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';

      await expect(service.remove(nonExistentId, testUserId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException when task belongs to another user', async () => {
      const createdTask = await service.create({
        userId: testUserId,
        data: { title: 'Task to Delete', description: 'Desc' },
      });

      const otherUserId = '00000000-0000-0000-0000-000000000001';

      await expect(service.remove(createdTask.id, otherUserId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('restore', () => {
    it('should restore a deleted task', async () => {
      // Create and delete a task
      const createdTask = await service.create({
        userId: testUserId,
        data: { title: 'Task to Restore', description: 'Desc' },
      });
      await service.remove(createdTask.id, testUserId);

      // Restore the task
      const result = await service.restore(createdTask.id, testUserId);

      expect(result).toMatchObject({
        id: createdTask.id,
        title: 'Task to Restore',
        deletedAt: null,
      });

      // Verify it appears again in searches
      const found = await service.findOne(createdTask.id, testUserId);
      expect(found).toBeDefined();
    });

    it('should throw NotFoundException when task does not exist', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';

      await expect(service.restore(nonExistentId, testUserId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.restore(nonExistentId, testUserId)).rejects.toThrow(
        `Tarefa com ID ${nonExistentId} não encontrada`,
      );
    });

    it('should throw NotFoundException when task is not deleted', async () => {
      const createdTask = await service.create({
        userId: testUserId,
        data: { title: 'Active Task', description: 'Desc' },
      });

      await expect(service.restore(createdTask.id, testUserId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.restore(createdTask.id, testUserId)).rejects.toThrow(
        `Tarefa com ID ${createdTask.id} não está deletada`,
      );
    });

    it('should throw NotFoundException when task belongs to another user', async () => {
      const createdTask = await service.create({
        userId: testUserId,
        data: { title: 'Task to Restore', description: 'Desc' },
      });
      await service.remove(createdTask.id, testUserId);

      const otherUserId = '00000000-0000-0000-0000-000000000001';

      await expect(
        service.restore(createdTask.id, otherUserId),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findDeleted', () => {
    it('should return deleted tasks for the user', async () => {
      // Create and delete a task
      const taskToDelete = await service.create({
        userId: testUserId,
        data: { title: 'Deleted Task', description: 'Desc' },
      });
      await service.remove(taskToDelete.id, testUserId);

      // Create an active task
      await service.create({
        userId: testUserId,
        data: { title: 'Active Task', description: 'Desc' },
      });

      const result = await service.findDeleted(testUserId);

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: taskToDelete.id,
        title: 'Deleted Task',
      });
      expect(result[0].deletedAt).not.toBeNull();
    });

    it('should return empty array when there are no deleted tasks', async () => {
      // Create only active tasks
      await service.create({
        userId: testUserId,
        data: { title: 'Active Task', description: 'Desc' },
      });

      const result = await service.findDeleted(testUserId);

      expect(result).toEqual([]);
    });
  });
});
