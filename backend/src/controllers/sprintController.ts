import { Request, Response } from 'express';
import { SprintService } from '../services/sprintService';

const sprintService = new SprintService();

export class SprintController {
  async create(req: Request, res: Response) {
    try {
      const { project_id, name, goal, start_date, end_date } = req.body;
      const sprint = await sprintService.createSprint({
        project_id,
        name,
        goal,
        start_date: new Date(start_date),
        end_date: new Date(end_date),
      });

      return res.status(201).json({
        success: true,
        data: sprint,
        message: 'Sprint created successfully',
      });
    } catch (error: any) {
      console.error('Create sprint error:', error);
      if (error.message === 'Project not found') {
        return res.status(404).json({
          success: false,
          error: {
            message: error.message,
            code: 'NOT_FOUND',
          },
        });
      }
      if (error.message === 'End date must be after start date') {
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
      const projectId = req.query.project_id as string;
      const sprints = await sprintService.getSprints(projectId);

      return res.status(200).json({
        success: true,
        data: sprints,
      });
    } catch (error) {
      console.error('Get sprints error:', error);
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
      const sprint = await sprintService.getSprintById(id);

      if (!sprint) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'Sprint not found',
            code: 'NOT_FOUND',
          },
        });
      }

      return res.status(200).json({
        success: true,
        data: sprint,
      });
    } catch (error) {
      console.error('Get sprint error:', error);
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

      if (updates.start_date) updates.start_date = new Date(updates.start_date);
      if (updates.end_date) updates.end_date = new Date(updates.end_date);

      const sprint = await sprintService.updateSprint(id, updates);

      if (!sprint) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'Sprint not found',
            code: 'NOT_FOUND',
          },
        });
      }

      return res.status(200).json({
        success: true,
        data: sprint,
        message: 'Sprint updated successfully',
      });
    } catch (error: any) {
      console.error('Update sprint error:', error);
      if (error.message === 'End date must be after start date') {
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
      const deleted = await sprintService.deleteSprint(id);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'Sprint not found',
            code: 'NOT_FOUND',
          },
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Sprint deleted successfully',
      });
    } catch (error) {
      console.error('Delete sprint error:', error);
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
