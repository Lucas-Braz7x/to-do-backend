import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const registerSchema = z.object({
  name: z
    .string({ error: 'Nome é obrigatório' })
    .min(1, { error: 'Nome é obrigatório' }),
  email: z
    .string({ error: 'Email é obrigatório' })
    .email({ error: 'Email inválido' }),
  password: z
    .string({ error: 'Senha é obrigatória' })
    .min(6, { error: 'Senha deve ter no mínimo 6 caracteres' }),
});

export class RegisterDto extends createZodDto(registerSchema) {}
