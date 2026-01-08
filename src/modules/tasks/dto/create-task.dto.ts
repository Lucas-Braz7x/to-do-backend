import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const createTaskSchema = z.object({
  title: z
    .string({ error: 'Título é obrigatório' })
    .min(1, { error: 'Título é obrigatório' }),
  description: z.string().optional(),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']).optional(),
});

export class CreateTaskDto extends createZodDto(createTaskSchema) {}
