import { Request, Response } from 'express';
import { NotificationService } from '../services/notificationService';

const notificationService = new NotificationService();

export class NotificationController {
  async getAll(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const is_read = req.query.is_read === 'true' ? true : req.query.is_read === 'false' ? false : undefined;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await notificationService.getNotifications(userId, {
        is_read,
        page,
        limit,
      });

      return res.status(200).json({
        success: true,
        data: result.notifications,
        pagination: {
          page: result.page,
          limit,
          total: result.total,
          totalPages: result.totalPages,
        },
      });
    } catch (error) {
      console.error('Get notifications error:', error);
      return res.status(500).json({
        success: false,
        error: {
          message: 'Internal server error',
          code: 'INTERNAL_ERROR',
        },
      });
    }
  }

  async markAsRead(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updated = await notificationService.markAsRead(id);

      if (!updated) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'Notification not found',
            code: 'NOT_FOUND',
          },
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Notification marked as read',
      });
    } catch (error) {
      console.error('Mark notification as read error:', error);
      return res.status(500).json({
        success: false,
        error: {
          message: 'Internal server error',
          code: 'INTERNAL_ERROR',
        },
      });
    }
  }

  async markAllAsRead(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      await notificationService.markAllAsRead(userId);

      return res.status(200).json({
        success: true,
        message: 'All notifications marked as read',
      });
    } catch (error) {
      console.error('Mark all notifications as read error:', error);
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
      const deleted = await notificationService.deleteNotification(id);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'Notification not found',
            code: 'NOT_FOUND',
          },
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Notification deleted successfully',
      });
    } catch (error) {
      console.error('Delete notification error:', error);
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
