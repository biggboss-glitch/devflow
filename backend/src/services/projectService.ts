import { ProjectRepository } from '../repositories/projectRepository';
import { TeamRepository } from '../repositories/teamRepository';
import { Project } from '../models/types';

export class ProjectService {
  private projectRepo: ProjectRepository;
  private teamRepo: TeamRepository;

  constructor() {
    this.projectRepo = new ProjectRepository();
    this.teamRepo = new TeamRepository();
  }

  async createProject(data: {
    team_id: string;
    name: string;
    description?: string;
    github_repo_url?: string;
  }): Promise<Project> {
    // Validate team exists
    const team = await this.teamRepo.findById(data.team_id);
    if (!team) {
      throw new Error('Team not found');
    }

    // Validate GitHub URL if provided
    if (data.github_repo_url && !this.isValidGitHubUrl(data.github_repo_url)) {
      throw new Error('Invalid GitHub repository URL');
    }

    return this.projectRepo.create(data);
  }

  async getProjects(teamId?: string, search?: string): Promise<Project[]> {
    if (search) {
      return this.projectRepo.search(search, teamId);
    }
    if (teamId) {
      return this.projectRepo.findByTeam(teamId);
    }
    return this.projectRepo.findAll();
  }

  async getProjectById(id: string): Promise<Project | null> {
    return this.projectRepo.findById(id);
  }

  async updateProject(
    id: string,
    updates: Partial<Pick<Project, 'name' | 'description' | 'github_repo_url'>>
  ): Promise<Project | null> {
    const project = await this.projectRepo.findById(id);
    if (!project) {
      return null;
    }

    if (updates.github_repo_url && !this.isValidGitHubUrl(updates.github_repo_url)) {
      throw new Error('Invalid GitHub repository URL');
    }

    return this.projectRepo.update(id, updates);
  }

  async deleteProject(id: string): Promise<boolean> {
    const project = await this.projectRepo.findById(id);
    if (!project) {
      return false;
    }
    return this.projectRepo.delete(id);
  }

  private isValidGitHubUrl(url: string): boolean {
    const githubRegex = /^https?:\/\/(www\.)?github\.com\/[\w-]+\/[\w.-]+\/?$/;
    return githubRegex.test(url);
  }
}
