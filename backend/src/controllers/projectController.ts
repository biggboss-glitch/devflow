import { Request, Response } from 'express';
import { ProjectService } from '../services/projectService';

const projectService = new ProjectService();

export class ProjectController {
  async create(req: Request, res: Response) {
    try {
      const { team_id, name, description, github_repo_url } = req.body;
      const project = await projectService.createProject({
        team_id,
        name,
        description,
        github_repo_url,
      });

      return res.status(201).json({
        success: true,
        data: project,
        message: 'Project created successfully',
      });
    } catch (error: any) {
      console.error('Create project error:', error);
      if (error.message === 'Team not found') {
        return res.status(404).json({
          success: false,
          error: {
            message: error.message,
            code: 'NOT_FOUND',
          },
        });
      }
      if (error.message === 'Invalid GitHub repository URL') {
        return res.status(400).json({
          success: false,
          error: {
            message: error.message,
            code: 'VALIDATION_ERROR',
          },
        });
      }
      return res.status(500).json({
        success: false,
        error: {
          message: 'Internal server error',
          code: 'INTERNAL_ERROR',
        },
      });
    }
  }

  async getAll(req: Request, res: Response) {
    try {
      const teamId = req.query.team_id as string;
      const search = req.query.search as string;
      const projects = await projectService.getProjects(teamId, search);

      return res.status(200).json({
        success: true,
        data: projects,
      });
    } catch (error) {
      console.error('Get projects error:', error);
      return res.status(500).json({
        success: false,
        error: {
          message: 'Internal server error',
          code: 'INTERNAL_ERROR',
        },
      });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const project = await projectService.getProjectById(id);

      if (!project) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'Project not found',
            code: 'NOT_FOUND',
          },
        });
      }

      return res.status(200).json({
        success: true,
        data: project,
      });
    } catch (error) {
      console.error('Get project error:', error);
      return res.status(500).json({
        success: false,
        error: {
          message: 'Internal server error',
          code: 'INTERNAL_ERROR',
        },
      });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updates = req.body;

      const project = await projectService.updateProject(id, updates);

      if (!project) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'Project not found',
            code: 'NOT_FOUND',
          },
        });
      }

      return res.status(200).json({
        success: true,
        data: project,
        message: 'Project updated successfully',
      });
    } catch (error: any) {
      console.error('Update project error:', error);
      if (error.message === 'Invalid GitHub repository URL') {
        return res.status(400).json({
          success: false,
          error: {
            message: error.message,
            code: 'VALIDATION_ERROR',
          },
        });
      }
      return res.status(500).json({
        success: false,
        error: {
          message: 'Internal server error',
          code: 'INTERNAL_ERROR',
        },
      });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const deleted = await projectService.deleteProject(id);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'Project not found',
            code: 'NOT_FOUND',
          },
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Project deleted successfully',
      });
    } catch (error) {
      console.error('Delete project error:', error);
      return res.status(500).json({
        success: false,
        error: {
          message: 'Internal server error',
          code: 'INTERNAL_ERROR',
        },
      });
    }
  }
}
