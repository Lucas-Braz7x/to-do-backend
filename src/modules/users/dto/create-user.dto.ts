import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const createUserSchema = z.object({
  email: z
    .string({ error: 'Email é obrigatório' })
    .email({ error: 'Email inválido' }),
  name: z
    .string({ error: 'Nome é obrigatório' })
    .min(1, { error: 'Nome é obrigatório' }),
  password: z
    .string({ error: 'Senha é obrigatória' })
    .min(6, { error: 'Senha deve ter no mínimo 6 caracteres' }),
});

export class CreateUserDto extends createZodDto(createUserSchema) {}
