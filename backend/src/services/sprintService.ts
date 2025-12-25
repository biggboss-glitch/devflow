import { SprintRepository } from '../repositories/sprintRepository';
import { ProjectRepository } from '../repositories/projectRepository';
import { Sprint } from '../models/types';

export class SprintService {
  private sprintRepo: SprintRepository;
  private projectRepo: ProjectRepository;

  constructor() {
    this.sprintRepo = new SprintRepository();
    this.projectRepo = new ProjectRepository();
  }

  async createSprint(data: {
    project_id: string;
    name: string;
    goal?: string;
    start_date: Date;
    end_date: Date;
  }): Promise<Sprint> {
    // Validate project exists
    const project = await this.projectRepo.findById(data.project_id);
    if (!project) {
      throw new Error('Project not found');
    }

    // Validate dates
    if (new Date(data.end_date) <= new Date(data.start_date)) {
      throw new Error('End date must be after start date');
    }

    return this.sprintRepo.create(data);
  }

  async getSprints(projectId?: string): Promise<Sprint[]> {
    if (projectId) {
      return this.sprintRepo.findByProject(projectId);
    }
    return this.sprintRepo.findAll();
  }

  async getSprintById(id: string): Promise<Sprint | null> {
    return this.sprintRepo.findById(id);
  }

  async updateSprint(
    id: string,
    updates: Partial<Pick<Sprint, 'name' | 'goal' | 'start_date' | 'end_date' | 'status'>>
  ): Promise<Sprint | null> {
    const sprint = await this.sprintRepo.findById(id);
    if (!sprint) {
      return null;
    }

    // Validate dates if both are provided
    if (updates.start_date && updates.end_date) {
      if (new Date(updates.end_date) <= new Date(updates.start_date)) {
        throw new Error('End date must be after start date');
      }
    }

    return this.sprintRepo.update(id, updates);
  }

  async deleteSprint(id: string): Promise<boolean> {
    const sprint = await this.sprintRepo.findById(id);
    if (!sprint) {
      return false;
    }
    return this.sprintRepo.delete(id);
  }

  async calculateProgress(_sprintId: string): Promise<{
    totalTasks: number;
    completedTasks: number;
    progressPercentage: number;
  }> {
    // This would query tasks for the sprint
    // Simplified for now
    return {
      totalTasks: 0,
      completedTasks: 0,
      progressPercentage: 0,
    };
  }
}
