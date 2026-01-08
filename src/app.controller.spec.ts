import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './modules/prisma/services/prisma.service';

describe('AppController', () => {
  let appController: AppController;

  const mockPrismaService = {
    isHealthy: jest.fn(),
  };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "App is running!"', () => {
      expect(appController.getHello()).toBe('App is running!');
    });
  });

  describe('health', () => {
    it('should return healthy status when database is connected', async () => {
      mockPrismaService.isHealthy.mockResolvedValue(true);

      const result = await appController.healthCheck();

      expect(result.status).toBe('ok');
      expect(result.database).toBe('connected');
      expect(result.timestamp).toBeDefined();
    });

    it('should return error status when database is disconnected', async () => {
      mockPrismaService.isHealthy.mockResolvedValue(false);

      const result = await appController.healthCheck();

      expect(result.status).toBe('error');
      expect(result.database).toBe('disconnected');
      expect(result.timestamp).toBeDefined();
    });
  });
});
