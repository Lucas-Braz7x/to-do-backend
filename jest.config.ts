import type { Config } from 'jest';

const config: Config = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  // Coverage collection configuration
  collectCoverageFrom: [
    'src/**/*.(t|j)s',
    // Exclude test files
    '!src/**/*.spec.(t|j)s',
    // Exclude DTOs and entities (simple data structures)
    '!src/**/*.dto.(t|j)s',
    '!src/**/*.entity.(t|j)s',
    // Exclude modules (NestJS configuration)
    '!src/**/*.module.(t|j)s',
    // Exclude barrel files
    '!src/**/index.(t|j)s',
    // Exclude main entry point
    '!src/main.(t|j)s',
    // Exclude infrastructure files (guards, strategies, decorators, prisma)
    '!src/**/guards/**',
    '!src/**/strategies/**',
    '!src/**/decorators/**',
    '!src/**/prisma/**',
  ],
  coverageDirectory: './coverage',
  // Coverage thresholds - fail if below minimum
  coverageThreshold: {
    global: {
      branches: 75, // Lower due to NestJS implicit decorator branches
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  // Coverage reporters
  coverageReporters: ['text', 'text-summary', 'lcov', 'html'],
  testEnvironment: 'node',
  roots: ['<rootDir>/src/'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  globalSetup: '<rootDir>/test/setup/global-setup.ts',
  globalTeardown: '<rootDir>/test/setup/global-teardown.ts',
  testTimeout: 30000,
  setupFilesAfterEnv: ['<rootDir>/test/setup/jest.setup.ts'],
  maxWorkers: 1,
};

export default config;
