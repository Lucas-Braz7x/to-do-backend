import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { prismaTest } from '../../../../test/setup/prisma-test.service';
import { PrismaService } from '../../prisma/services/prisma.service';
import { UserRepository } from '../../users/repositories/user.repository';
import { LoginDto, RegisterDto } from '../dto';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  // PrismaService mock that uses prismaTest
  const mockPrismaService = {
    client: prismaTest,
  };

  // JwtService mock
  const mockJwtService = {
    sign: jest.fn().mockReturnValue('mock-jwt-token'),
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        UserRepository,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  beforeEach(async () => {
    // Clean the database before each test
    await prismaTest.cleanDatabase();
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await prismaTest.cleanDatabase();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user and return access token', async () => {
      const registerDto: RegisterDto = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      };

      const result = await service.register(registerDto);

      expect(result).toMatchObject({
        accessToken: 'mock-jwt-token',
        user: {
          email: registerDto.email,
          name: registerDto.name,
        },
      });
      expect(result.user.id).toBeDefined();
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: result.user.id,
        email: registerDto.email,
      });
    });

    it('should hash the password before saving', async () => {
      const registerDto: RegisterDto = {
        name: 'Test User',
        email: 'hash@example.com',
        password: 'password123',
      };

      await service.register(registerDto);

      // Verify the user was saved with hashed password
      const savedUser = await prismaTest.user.findUnique({
        where: { email: registerDto.email },
      });

      expect(savedUser).toBeDefined();
      expect(savedUser?.password).not.toBe(registerDto.password);

      // Verify the password can be compared with bcrypt
      const isPasswordValid = await bcrypt.compare(
        registerDto.password,
        savedUser!.password,
      );
      expect(isPasswordValid).toBe(true);
    });

    it('should throw ConflictException when email already exists', async () => {
      const registerDto: RegisterDto = {
        name: 'Test User',
        email: 'duplicate@example.com',
        password: 'password123',
      };

      // Register the first user
      await service.register(registerDto);

      // Try to register with the same email
      await expect(service.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.register(registerDto)).rejects.toThrow(
        'Email já está em uso',
      );
    });
  });

  describe('login', () => {
    const testPassword = 'password123';

    beforeEach(async () => {
      // Create a test user with hashed password
      const hashedPassword = await bcrypt.hash(testPassword, 10);
      await prismaTest.user.create({
        data: {
          name: 'Login User',
          email: 'login@example.com',
          password: hashedPassword,
        },
      });
    });

    it('should login successfully and return access token', async () => {
      const loginDto: LoginDto = {
        email: 'login@example.com',
        password: testPassword,
      };

      const result = await service.login(loginDto);

      expect(result).toMatchObject({
        accessToken: 'mock-jwt-token',
        user: {
          email: loginDto.email,
          name: 'Login User',
        },
      });
      expect(result.user.id).toBeDefined();
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: result.user.id,
        email: loginDto.email,
      });
    });

    it('should throw UnauthorizedException when email does not exist', async () => {
      const loginDto: LoginDto = {
        email: 'nonexistent@example.com',
        password: testPassword,
      };

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.login(loginDto)).rejects.toThrow(
        'Credenciais inválidas',
      );
    });

    it('should throw UnauthorizedException when password is incorrect', async () => {
      const loginDto: LoginDto = {
        email: 'login@example.com',
        password: 'wrongpassword',
      };

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.login(loginDto)).rejects.toThrow(
        'Credenciais inválidas',
      );
    });
  });

  describe('validateUserById', () => {
    it('should return user when user exists', async () => {
      // Create a test user
      const user = await prismaTest.user.create({
        data: {
          name: 'Validate User',
          email: 'validate@example.com',
          password: 'hashedpassword',
        },
      });

      const result = await service.validateUserById(user.id);

      expect(result).toMatchObject({
        id: user.id,
        email: 'validate@example.com',
        name: 'Validate User',
      });
    });

    it('should throw UnauthorizedException when user does not exist', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';

      await expect(service.validateUserById(nonExistentId)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.validateUserById(nonExistentId)).rejects.toThrow(
        'Usuário não encontrado',
      );
    });
  });
});
