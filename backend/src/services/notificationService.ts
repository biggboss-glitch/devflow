import { NotificationRepository } from '../repositories/notificationRepository';
import { Notification } from '../models/types';
import { io } from '../server';

export class NotificationService {
  private notificationRepo: NotificationRepository;

  constructor() {
    this.notificationRepo = new NotificationRepository();
  }

  async createNotification(data: {
    user_id: string;
    type: string;
    title: string;
    message: string;
    link?: string;
  }): Promise<Notification> {
    const notification = await this.notificationRepo.create(data);
    
    // Emit WebSocket event
    io.to(`user:${data.user_id}`).emit('notification', notification);
    
    return notification;
  }

  async notifyTaskAssignment(taskId: string, assigneeId: string, taskTitle: string): Promise<void> {
    await this.createNotification({
      user_id: assigneeId,
      type: 'task_assigned',
      title: 'New Task Assigned',
      message: `You have been assigned to task: ${taskTitle}`,
      link: `/tasks/${taskId}`,
    });
  }

  async notifyTaskStatusChange(
    taskId: string,
    userId: string,
    taskTitle: string,
    newStatus: string
  ): Promise<void> {
    await this.createNotification({
      user_id: userId,
      type: 'task_updated',
      title: 'Task Status Updated',
      message: `Task "${taskTitle}" status changed to ${newStatus}`,
      link: `/tasks/${taskId}`,
    });
  }

  async notifyNewComment(
    taskId: string,
    userId: string,
    taskTitle: string,
    commenterName: string
  ): Promise<void> {
    await this.createNotification({
      user_id: userId,
      type: 'comment_added',
      title: 'New Comment',
      message: `${commenterName} commented on task: ${taskTitle}`,
      link: `/tasks/${taskId}`,
    });
  }

  async getNotifications(
    userId: string,
    filters: { is_read?: boolean; page?: number; limit?: number }
  ): Promise<{ notifications: Notification[]; total: number; page: number; totalPages: number }> {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const offset = (page - 1) * limit;

    const result = await this.notificationRepo.findByUser(userId, {
      is_read: filters.is_read,
      limit,
      offset,
    });

    return {
      notifications: result.notifications,
      total: result.total,
      page,
      totalPages: Math.ceil(result.total / limit),
    };
  }

  async markAsRead(id: string): Promise<boolean> {
    return this.notificationRepo.markAsRead(id);
  }

  async markAllAsRead(userId: string): Promise<boolean> {
    return this.notificationRepo.markAllAsRead(userId);
  }

  async deleteNotification(id: string): Promise<boolean> {
    return this.notificationRepo.delete(id);
  }
}
