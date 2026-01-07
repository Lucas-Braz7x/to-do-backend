import { execSync } from 'child_process';
import { Client } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';

export default async function globalSetup(): Promise<void> {
  // Carrega variáveis do .env.test
  dotenv.config({ path: path.resolve(__dirname, '../../.env.test') });

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL não está definida no .env.test');
  }

  // Extrai informações da URL do banco
  const url = new URL(databaseUrl);
  const testDbName = url.pathname.slice(1).split('?')[0]; // Remove a barra inicial e query params
  const mainDbUrl = databaseUrl.replace(`/${testDbName}`, '/postgres');

  console.log(`\n🔧 Preparando banco de dados de teste: ${testDbName}\n`);

  // Conecta ao banco postgres para criar o banco de teste
  const client = new Client({ connectionString: mainDbUrl });

  try {
    await client.connect();

    // Verifica se o banco de teste existe
    const result = await client.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [testDbName],
    );

    if (result.rowCount === 0) {
      console.log(`📦 Criando banco de dados: ${testDbName}`);
      await client.query(`CREATE DATABASE "${testDbName}"`);
    } else {
      console.log(`✅ Banco de dados ${testDbName} já existe`);
    }
  } finally {
    await client.end();
  }

  // Executa as migrações do Prisma no banco de teste
  console.log('🔄 Executando migrações do Prisma...');
  execSync('npx prisma migrate deploy', {
    env: {
      ...process.env,
      DATABASE_URL: databaseUrl,
    },
    cwd: path.resolve(__dirname, '../..'),
    stdio: 'inherit',
  });

  // Gera o Prisma Client
  console.log('🔄 Gerando Prisma Client...');
  execSync('npx prisma generate', {
    cwd: path.resolve(__dirname, '../..'),
    stdio: 'inherit',
  });

  console.log('✅ Setup do banco de teste concluído!\n');
}
