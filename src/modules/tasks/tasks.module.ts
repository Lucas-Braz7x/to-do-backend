import { Module } from '@nestjs/common';
import { TasksController } from './presentation/tasks.controller';
import { TaskRepository } from './repositories/task.repository';
import { TasksService } from './services/tasks.service';

@Module({
  controllers: [TasksController],
  providers: [TasksService, TaskRepository],
  exports: [TaskRepository],
})
export class TasksModule {}
