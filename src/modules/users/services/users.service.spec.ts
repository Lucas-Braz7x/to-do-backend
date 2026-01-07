import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { prismaTest } from '../../../../test/setup/prisma-test.service';
import { PrismaService } from '../../prisma/services/prisma.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserRepository } from '../repositories/user.repository';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;

  // PrismaService mock that uses prismaTest
  const mockPrismaService = {
    client: prismaTest,
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        UserRepository,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  beforeEach(async () => {
    // Clean the database before each test
    await prismaTest.cleanDatabase();
  });

  afterAll(async () => {
    await prismaTest.cleanDatabase();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a user', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'password123',
      };

      const result = await service.create(createUserDto);

      expect(result).toMatchObject({
        email: createUserDto.email,
        name: createUserDto.name,
        password: createUserDto.password,
      });
      expect(result.id).toBeDefined();
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      // Create two users
      await service.create({
        email: 'user1@example.com',
        name: 'User 1',
        password: 'password1',
      });
      await service.create({
        email: 'user2@example.com',
        name: 'User 2',
        password: 'password2',
      });

      const result = await service.findAll();

      expect(result).toHaveLength(2);
      expect(result).toMatchObject([
        { email: 'user1@example.com', name: 'User 1' },
        { email: 'user2@example.com', name: 'User 2' },
      ]);
    });

    it('should return empty array when there are no users', async () => {
      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a user by ID', async () => {
      const createdUser = await service.create({
        email: 'find@example.com',
        name: 'Find User',
        password: 'password',
      });

      const result = await service.findOne(createdUser.id);

      expect(result).toMatchObject({
        id: createdUser.id,
        email: 'find@example.com',
        name: 'Find User',
      });
    });

    it('should throw NotFoundException when user does not exist', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';

      await expect(service.findOne(nonExistentId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findOne(nonExistentId)).rejects.toThrow(
        `Usuário com ID ${nonExistentId} não encontrado`,
      );
    });
  });

  describe('findByEmail', () => {
    it('should return a user by email', async () => {
      const createdUser = await service.create({
        email: 'email@example.com',
        name: 'Email User',
        password: 'password',
      });

      const result = await service.findByEmail('email@example.com');

      expect(result).toMatchObject({
        id: createdUser.id,
        email: 'email@example.com',
        name: 'Email User',
      });
    });

    it('should return null when email does not exist', async () => {
      const result = await service.findByEmail('nonexistent@example.com');

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update an existing user', async () => {
      const createdUser = await service.create({
        email: 'update@example.com',
        name: 'Update User',
        password: 'password',
      });

      const updateUserDto: UpdateUserDto = {
        name: 'Updated Name',
      };

      const result = await service.update(createdUser.id, updateUserDto);

      expect(result).toMatchObject({
        name: 'Updated Name',
        email: 'update@example.com',
      });
    });

    it('should throw NotFoundException when user does not exist', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';
      const updateUserDto: UpdateUserDto = { name: 'Updated Name' };

      await expect(
        service.update(nonExistentId, updateUserDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove an existing user', async () => {
      const createdUser = await service.create({
        email: 'remove@example.com',
        name: 'Remove User',
        password: 'password',
      });

      const result = await service.remove(createdUser.id);

      expect(result).toMatchObject({
        id: createdUser.id,
        email: 'remove@example.com',
      });

      // Verify the user was removed
      await expect(service.findOne(createdUser.id)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException when user does not exist', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';

      await expect(service.remove(nonExistentId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
