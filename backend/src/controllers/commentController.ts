import { Request, Response } from 'express';
import { CommentService } from '../services/commentService';
import { NotificationService } from '../services/notificationService';
import { TaskService } from '../services/taskService';

const commentService = new CommentService();
const notificationService = new NotificationService();
const taskService = new TaskService();

export class CommentController {
  async create(req: Request, res: Response) {
    try {
      const { taskId } = req.params;
      const { content } = req.body;
      const user_id = req.user!.userId;

      const comment = await commentService.createComment({
        task_id: taskId,
        user_id,
        content,
      });

      // Get task details for notification
      const task = await taskService.getTaskById(taskId);
      if (task && task.assignee_id && task.assignee_id !== user_id) {
        await notificationService.notifyNewComment(
          taskId,
          task.assignee_id,
          task.title,
          req.user!.email
        );
      }

      return res.status(201).json({
        success: true,
        data: comment,
        message: 'Comment created successfully',
      });
    } catch (error) {
      console.error('Create comment error:', error);
      return res.status(500).json({
        success: false,
        error: {
          message: 'Internal server error',
          code: 'INTERNAL_ERROR',
        },
      });
    }
  }

  async getByTask(req: Request, res: Response) {
    try {
      const { taskId } = req.params;
      const comments = await commentService.getCommentsByTask(taskId);

      return res.status(200).json({
        success: true,
        data: comments,
      });
    } catch (error) {
      console.error('Get comments error:', error);
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
      const { content } = req.body;
      const userId = req.user!.userId;

      const comment = await commentService.updateComment(id, content, userId);

      if (!comment) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'Comment not found',
            code: 'NOT_FOUND',
          },
        });
      }

      return res.status(200).json({
        success: true,
        data: comment,
        message: 'Comment updated successfully',
      });
    } catch (error: any) {
      console.error('Update comment error:', error);
      if (error.message === 'Unauthorized to edit this comment') {
        return res.status(403).json({
          success: false,
          error: {
            message: error.message,
            code: 'FORBIDDEN',
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
      const userId = req.user!.userId;
      const isAdmin = req.user!.role === 'admin';

      const deleted = await commentService.deleteComment(id, userId, isAdmin);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'Comment not found',
            code: 'NOT_FOUND',
          },
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Comment deleted successfully',
      });
    } catch (error: any) {
      console.error('Delete comment error:', error);
      if (error.message === 'Unauthorized to delete this comment') {
        return res.status(403).json({
          success: false,
          error: {
            message: error.message,
            code: 'FORBIDDEN',
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
}
