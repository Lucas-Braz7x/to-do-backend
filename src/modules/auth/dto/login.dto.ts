import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string({ error: 'Email é obrigatório' })
    .email({ error: 'Email inválido' }),
  password: z
    .string({ error: 'Senha é obrigatória' })
    .min(6, { error: 'Senha deve ter no mínimo 6 caracteres' }),
});

export class LoginDto extends createZodDto(loginSchema) {}
