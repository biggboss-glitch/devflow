import pool from '../config/database';
import { Notification } from '../models/types';

export class NotificationRepository {
  async create(data: {
    user_id: string;
    type: string;
    title: string;
    message: string;
    link?: string;
  }): Promise<Notification> {
    const query = `
      INSERT INTO notifications (user_id, type, title, message, link)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const values = [data.user_id, data.type, data.title, data.message, data.link || null];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  async findByUser(
    userId: string,
    filters: { is_read?: boolean; limit?: number; offset?: number }
  ): Promise<{ notifications: Notification[]; total: number }> {
    let query = 'SELECT * FROM notifications WHERE user_id = $1';
    const values: any[] = [userId];
    let paramCount = 2;

    if (filters.is_read !== undefined) {
      query += ` AND is_read = $${paramCount++}`;
      values.push(filters.is_read);
    }

    // Get total count
    const countQuery = query.replace('SELECT *', 'SELECT COUNT(*)');
    const countResult = await pool.query(countQuery, values);
    const total = parseInt(countResult.rows[0].count);

    // Add pagination
    query += ` ORDER BY created_at DESC`;
    const limit = filters.limit || 20;
    const offset = filters.offset || 0;
    query += ` LIMIT $${paramCount++} OFFSET $${paramCount}`;
    values.push(limit, offset);

    const result = await pool.query(query, values);
    return { notifications: result.rows, total };
  }

  async markAsRead(id: string): Promise<boolean> {
    const query = 'UPDATE notifications SET is_read = true WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rowCount !== null && result.rowCount > 0;
  }

  async markAllAsRead(userId: string): Promise<boolean> {
    const query = 'UPDATE notifications SET is_read = true WHERE user_id = $1 AND is_read = false';
    const result = await pool.query(query, [userId]);
    return result.rowCount !== null && result.rowCount > 0;
  }

  async delete(id: string): Promise<boolean> {
    const query = 'DELETE FROM notifications WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rowCount !== null && result.rowCount > 0;
  }
}
