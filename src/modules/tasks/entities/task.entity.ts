import { TaskStatus } from '@prisma/client';
import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { AuditCreatedUpdated } from '../../users/entities/user.entity';

export class Task extends AuditCreatedUpdated {
  @IsUUID()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string | null;

  @IsEnum(TaskStatus)
  @IsNotEmpty()
  status: TaskStatus;

  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @IsDate()
  @IsOptional()
  deletedAt?: Date | null;
}
