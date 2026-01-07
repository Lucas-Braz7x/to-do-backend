import { Test, TestingModule } from '@nestjs/testing';
import type { User } from '@prisma/client';
import { AuthResponseDto, LoginDto, RegisterDto } from '../dto';
import { AuthService } from '../services/auth.service';
import { AuthController } from './auth.controller';

describe('AuthController', () => {
  let controller: AuthController;

  const mockUser: User = {
    id: 'user-uuid-1',
    email: 'test@example.com',
    name: 'Test User',
    password: 'hashed_password',
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
  };

  const mockAuthResponse: AuthResponseDto = {
    accessToken: 'mock-jwt-token',
    user: {
      id: 'user-uuid-1',
      email: 'test@example.com',
      name: 'Test User',
    },
  };

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should call authService.register with correct params', async () => {
      const registerDto: RegisterDto = {
        name: 'New User',
        email: 'new@example.com',
        password: 'password123',
      };

      mockAuthService.register.mockResolvedValue(mockAuthResponse);

      const result = await controller.register(registerDto);

      expect(mockAuthService.register).toHaveBeenCalledWith(registerDto);
      expect(result).toEqual(mockAuthResponse);
    });

    it('should return AuthResponseDto with accessToken and user', async () => {
      const registerDto: RegisterDto = {
        name: 'New User',
        email: 'new@example.com',
        password: 'password123',
      };

      const expectedResponse: AuthResponseDto = {
        accessToken: 'mock-jwt-token',
        user: {
          id: 'new-user-uuid',
          email: registerDto.email,
          name: registerDto.name,
        },
      };

      mockAuthService.register.mockResolvedValue(expectedResponse);

      const result = await controller.register(registerDto);

      expect(result).toMatchObject({
        accessToken: expectedResponse.accessToken,
        user: {
          id: expectedResponse.user.id,
          email: registerDto.email,
          name: registerDto.name,
        },
      });
    });
  });

  describe('login', () => {
    it('should call authService.login with correct params', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      mockAuthService.login.mockResolvedValue(mockAuthResponse);

      const result = await controller.login(loginDto);

      expect(mockAuthService.login).toHaveBeenCalledWith(loginDto);
      expect(result).toEqual(mockAuthResponse);
    });

    it('should return AuthResponseDto with accessToken and user', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      mockAuthService.login.mockResolvedValue(mockAuthResponse);

      const result = await controller.login(loginDto);

      expect(result).toMatchObject({
        accessToken: mockAuthResponse.accessToken,
        user: {
          id: mockAuthResponse.user.id,
          email: loginDto.email,
        },
      });
    });
  });

  describe('me', () => {
    it('should return the current user', () => {
      const result = controller.me(mockUser);

      expect(result).toEqual(mockUser);
    });

    it('should return user with all properties', () => {
      const result = controller.me(mockUser);

      expect(result).toMatchObject({
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
      });
    });
  });
});
