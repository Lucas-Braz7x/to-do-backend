import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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
  @ApiProperty({ description: 'ID da tarefa', example: 'uuid-123' })
  @IsUUID()
  @IsNotEmpty()
  id: string;

  @ApiProperty({
    description: 'Título da tarefa',
    example: 'Finalizar relatório',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({
    description: 'Descrição da tarefa',
    example: 'Relatório mensal de vendas',
  })
  @IsString()
  @IsOptional()
  description?: string | null;

  @ApiProperty({
    description: 'Status da tarefa',
    enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED'],
    example: 'PENDING',
  })
  @IsEnum(TaskStatus)
  @IsNotEmpty()
  status: TaskStatus;

  @ApiProperty({
    description: 'ID do usuário proprietário',
    example: 'uuid-456',
  })
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @ApiPropertyOptional({
    description: 'Data de exclusão (soft delete)',
    example: null,
  })
  @IsDate()
  @IsOptional()
  deletedAt?: Date | null;
}
