import { TaskRepository } from '../repositories/taskRepository';
import { Task } from '../models/types';

export class TaskService {
  private taskRepo: TaskRepository;

  constructor() {
    this.taskRepo = new TaskRepository();
  }

  async createTask(data: {
    sprint_id: string;
    title: string;
    description?: string;
    priority: string;
    story_points?: number;
    assignee_id?: string;
    creator_id: string;
  }): Promise<Task> {
    const task = await this.taskRepo.create(data);
    
    // Record initial status
    await this.taskRepo.recordStatusChange(task.id, null, 'todo', data.creator_id);
    
    return task;
  }

  async getTasks(filters: {
    sprint_id?: string;
    status?: string;
    priority?: string;
    assignee_id?: string;
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
  }): Promise<{ tasks: Task[]; total: number; page: number; totalPages: number }> {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const offset = (page - 1) * limit;

    const result = await this.taskRepo.findAll({
      ...filters,
      limit,
      offset,
    });

    return {
      tasks: result.tasks,
      total: result.total,
      page,
      totalPages: Math.ceil(result.total / limit),
    };
  }

  async getTaskById(id: string): Promise<Task | null> {
    return this.taskRepo.findById(id);
  }

  async updateTask(id: string, updates: Partial<Task>, userId: string): Promise<Task | null> {
    const task = await this.taskRepo.findById(id);
    if (!task) {
      return null;
    }

    // Record status change if status is being updated
    if (updates.status && updates.status !== task.status) {
      await this.taskRepo.recordStatusChange(task.id, task.status, updates.status, userId);
    }

    return this.taskRepo.update(id, updates);
  }

  async deleteTask(id: string): Promise<boolean> {
    const task = await this.taskRepo.findById(id);
    if (!task) {
      return false;
    }
    return this.taskRepo.delete(id);
  }

  async updateStatus(
    id: string,
    status: string,
    userId: string
  ): Promise<Task | null> {
    const task = await this.taskRepo.findById(id);
    if (!task) {
      return null;
    }

    // Validate status transition
    const validTransitions: Record<string, string[]> = {
      todo: ['in_progress'],
      in_progress: ['in_review', 'todo'],
      in_review: ['done', 'in_progress'],
      done: ['in_review'],
    };

    if (!validTransitions[task.status]?.includes(status)) {
      throw new Error(`Invalid status transition from ${task.status} to ${status}`);
    }

    await this.taskRepo.recordStatusChange(task.id, task.status, status, userId);
    return this.taskRepo.update(id, { status } as Partial<Task>);
  }

  async assignTask(id: string, assigneeId: string): Promise<Task | null> {
    const task = await this.taskRepo.findById(id);
    if (!task) {
      return null;
    }
    return this.taskRepo.update(id, { assignee_id: assigneeId } as Partial<Task>);
  }
}
