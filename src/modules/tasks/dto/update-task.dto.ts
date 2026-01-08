import { createZodDto } from 'nestjs-zod';
import { createTaskSchema } from './create-task.dto';

export const updateTaskSchema = createTaskSchema.partial();

export class UpdateTaskDto extends createZodDto(updateTaskSchema) {}
