import { z } from 'zod';

export const envSchema = z.object({
  // Database
  DATABASE_URL: z
    .string({ error: 'DATABASE_URL is required' })
    .url({ error: 'DATABASE_URL must be a valid URL' }),

  // JWT
  JWT_SECRET: z
    .string({ error: 'JWT_SECRET is required' })
    .min(8, { error: 'JWT_SECRET must be at least 8 characters' }),

  // Server
  PORT: z.coerce.number().positive().default(3000),
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),

  // CORS
  CORS_ORIGIN: z.string().default('*'),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(): Env {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error('❌ Invalid environment variables:');
    console.error(result.error.flatten().fieldErrors);
    process.exit(1);
  }

  return result.data;
}
