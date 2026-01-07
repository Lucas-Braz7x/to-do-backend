import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Carrega variáveis do .env.test
dotenv.config({ path: path.resolve(__dirname, '../../.env.test') });

/**
 * PrismaClient singleton para testes
 * Usa o banco de dados de teste configurado no .env.test
 */
class PrismaTestClient extends PrismaClient {
  private static instance: PrismaTestClient | null = null;

  private constructor() {
    super({
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    });
  }

  static getInstance(): PrismaTestClient {
    if (!PrismaTestClient.instance) {
      PrismaTestClient.instance = new PrismaTestClient();
    }
    return PrismaTestClient.instance;
  }

  /**
   * Limpa todas as tabelas do banco de dados de teste
   * Útil para executar antes de cada teste
   */
  async cleanDatabase(): Promise<void> {
    // Ordem importa devido às foreign keys
    // Deleta primeiro as tabelas que dependem de outras
    await this.$transaction([this.task.deleteMany(), this.user.deleteMany()]);
  }

  /**
   * Limpa apenas a tabela de tarefas
   */
  async cleanTasks(): Promise<void> {
    await this.task.deleteMany();
  }

  /**
   * Limpa apenas a tabela de usuários (e tarefas associadas)
   */
  async cleanUsers(): Promise<void> {
    await this.$transaction([this.task.deleteMany(), this.user.deleteMany()]);
  }

  /**
   * Desconecta do banco de dados
   */
  async disconnect(): Promise<void> {
    await this.$disconnect();
    PrismaTestClient.instance = null;
  }
}

export const prismaTest = PrismaTestClient.getInstance();
export { PrismaTestClient };
