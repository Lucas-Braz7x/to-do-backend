import * as dotenv from 'dotenv';
import * as path from 'path';

// Carrega variáveis de ambiente do .env.test antes de cada arquivo de teste
dotenv.config({ path: path.resolve(__dirname, '../../.env.test') });

// Exporta o prisma de teste para uso nos testes
export { prismaTest } from './prisma-test.service';
