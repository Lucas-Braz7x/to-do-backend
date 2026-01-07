import * as dotenv from 'dotenv';
import * as path from 'path';

export default async function globalTeardown(): Promise<void> {
  // Carrega variáveis do .env.test
  dotenv.config({ path: path.resolve(__dirname, '../../.env.test') });

  console.log('\n🧹 Finalizando testes...');
  console.log('✅ Teardown concluído!\n');

  // Nota: Não deletamos o banco de teste para permitir inspeção manual
  // Se quiser limpar automaticamente, descomente o código abaixo:
  /*
  const { Client } = await import('pg');
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) return;

  const url = new URL(databaseUrl);
  const testDbName = url.pathname.slice(1).split('?')[0];
  const mainDbUrl = databaseUrl.replace(`/${testDbName}`, '/postgres');

  const client = new Client({ connectionString: mainDbUrl });
  try {
    await client.connect();
    await client.query(`DROP DATABASE IF EXISTS "${testDbName}"`);
    console.log(`🗑️ Banco de dados ${testDbName} removido`);
  } finally {
    await client.end();
  }
  */
}
