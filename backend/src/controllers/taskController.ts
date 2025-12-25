import { Request, Response } from 'express';
import { TaskService } from '../services/taskService';
import { NotificationService } from '../services/notificationService';

const taskService = new TaskService();
const notificationService = new NotificationService();

export class TaskController {
  async create(req: Request, res: Response) {
    try {
      const { sprint_id, title, description, priority, story_points, assignee_id } = req.body;
      const creator_id = req.user!.userId;

      const task = await taskService.createTask({
        sprint_id,
        title,
        description,
        priority,
        story_points,
        assignee_id,
        creator_id,
      });

      // Notify assignee if assigned
      if (assignee_id) {
        await notificationService.notifyTaskAssignment(task.id, assignee_id, task.title);
      }

      return res.status(201).json({
        success: true,
        data: task,
        message: 'Task created successfully',
      });
    } catch (error: any) {
      console.error('Create task error:', error);
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
      const filters = {
        sprint_id: req.query.sprint_id as string,
        status: req.query.status as string,
        priority: req.query.priority as string,
        assignee_id: req.query.assignee_id as string,
        search: req.query.search as string,
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20,
        sortBy: req.query.sortBy as string,
      };

      const result = await taskService.getTasks(filters);

      return res.status(200).json({
        success: true,
        data: result.tasks,
        pagination: {
          page: result.page,
          limit: filters.limit,
          total: result.total,
          totalPages: result.totalPages,
        },
      });
    } catch (error) {
      console.error('Get tasks error:', error);
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
      const task = await taskService.getTaskById(id);

      if (!task) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'Task not found',
            code: 'NOT_FOUND',
          },
        });
      }

      return res.status(200).json({
        success: true,
        data: task,
      });
    } catch (error) {
      console.error('Get task error:', error);
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
      const userId = req.user!.userId;

      const task = await taskService.updateTask(id, updates, userId);

      if (!task) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'Task not found',
            code: 'NOT_FOUND',
          },
        });
      }

      return res.status(200).json({
        success: true,
        data: task,
        message: 'Task updated successfully',
      });
    } catch (error) {
      console.error('Update task error:', error);
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
      const deleted = await taskService.deleteTask(id);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'Task not found',
            code: 'NOT_FOUND',
          },
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Task deleted successfully',
      });
    } catch (error) {
      console.error('Delete task error:', error);
      return res.status(500).json({
        success: false,
        error: {
          message: 'Internal server error',
          code: 'INTERNAL_ERROR',
        },
      });
    }
  }

  async updateStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const userId = req.user!.userId;

      const task = await taskService.updateStatus(id, status, userId);

      if (!task) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'Task not found',
            code: 'NOT_FOUND',
          },
        });
      }

      // Notify task creator and assignee
      if (task.assignee_id) {
        await notificationService.notifyTaskStatusChange(task.id, task.assignee_id, task.title, status);
      }

      return res.status(200).json({
        success: true,
        data: task,
        message: 'Task status updated successfully',
      });
    } catch (error: any) {
      console.error('Update task status error:', error);
      if (error.message.includes('Invalid status transition')) {
        return res.status(400).json({
          success: false,
          error: {
            message: error.message,
            code: 'INVALID_TRANSITION',
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

  async assign(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { assignee_id } = req.body;

      const task = await taskService.assignTask(id, assignee_id);

      if (!task) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'Task not found',
            code: 'NOT_FOUND',
          },
        });
      }

      // Notify assignee
      await notificationService.notifyTaskAssignment(task.id, assignee_id, task.title);

      return res.status(200).json({
        success: true,
        data: task,
        message: 'Task assigned successfully',
      });
    } catch (error) {
      console.error('Assign task error:', error);
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
