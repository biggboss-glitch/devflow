import pool from '../config/database';
import { Comment } from '../models/types';

export class CommentRepository {
  async create(data: {
    task_id: string;
    user_id: string;
    content: string;
  }): Promise<Comment> {
    const query = `
      INSERT INTO comments (task_id, user_id, content)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const values = [data.task_id, data.user_id, data.content];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  async findByTask(taskId: string): Promise<Comment[]> {
    const query = `
      SELECT c.*, u.name as user_name, u.avatar_url as user_avatar
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.task_id = $1 AND c.is_deleted = false
      ORDER BY c.created_at ASC
    `;
    const result = await pool.query(query, [taskId]);
    return result.rows;
  }

  async findById(id: string): Promise<Comment | null> {
    const query = 'SELECT * FROM comments WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  async update(id: string, content: string): Promise<Comment | null> {
    const query = `
      UPDATE comments
      SET content = $1, is_edited = true, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;
    const result = await pool.query(query, [content, id]);
    return result.rows[0] || null;
  }

  async softDelete(id: string): Promise<boolean> {
    const query = `
      UPDATE comments
      SET is_deleted = true, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rowCount !== null && result.rowCount > 0;
  }
}
