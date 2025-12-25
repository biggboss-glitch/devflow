import pool from '../config/database';
import { Task } from '../models/types';

export class TaskRepository {
  async create(data: {
    sprint_id: string;
    title: string;
    description?: string;
    priority: string;
    story_points?: number;
    assignee_id?: string;
    creator_id: string;
  }): Promise<Task> {
    const query = `
      INSERT INTO tasks (sprint_id, title, description, priority, story_points, assignee_id, creator_id, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'todo')
      RETURNING *
    `;
    const values = [
      data.sprint_id,
      data.title,
      data.description || null,
      data.priority,
      data.story_points || null,
      data.assignee_id || null,
      data.creator_id,
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  async findAll(filters: {
    sprint_id?: string;
    status?: string;
    priority?: string;
    assignee_id?: string;
    search?: string;
    limit?: number;
    offset?: number;
    sortBy?: string;
  }): Promise<{ tasks: Task[]; total: number }> {
    let query = 'SELECT * FROM tasks WHERE 1=1';
    const values: any[] = [];
    let paramCount = 1;

    if (filters.sprint_id) {
      query += ` AND sprint_id = $${paramCount++}`;
      values.push(filters.sprint_id);
    }
    if (filters.status) {
      query += ` AND status = $${paramCount++}`;
      values.push(filters.status);
    }
    if (filters.priority) {
      query += ` AND priority = $${paramCount++}`;
      values.push(filters.priority);
    }
    if (filters.assignee_id) {
      query += ` AND assignee_id = $${paramCount++}`;
      values.push(filters.assignee_id);
    }
    if (filters.search) {
      query += ` AND (LOWER(title) LIKE LOWER($${paramCount}) OR LOWER(description) LIKE LOWER($${paramCount}))`;
      values.push(`%${filters.search}%`);
      paramCount++;
    }

    // Get total count
    const countQuery = query.replace('SELECT *', 'SELECT COUNT(*)');
    const countResult = await pool.query(countQuery, values);
    const total = parseInt(countResult.rows[0].count);

    // Add sorting
    const sortBy = filters.sortBy || 'created_at';
    query += ` ORDER BY ${sortBy} DESC`;

    // Add pagination
    const limit = filters.limit || 20;
    const offset = filters.offset || 0;
    query += ` LIMIT $${paramCount++} OFFSET $${paramCount}`;
    values.push(limit, offset);

    const result = await pool.query(query, values);
    return { tasks: result.rows, total };
  }

  async findById(id: string): Promise<Task | null> {
    const query = 'SELECT * FROM tasks WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  async update(id: string, updates: Partial<Task>): Promise<Task | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    const allowedFields = [
      'title',
      'description',
      'status',
      'priority',
      'story_points',
      'assignee_id',
      'github_pr_url',
      'github_pr_status',
    ];

    for (const field of allowedFields) {
      if (updates[field as keyof Task] !== undefined) {
        fields.push(`${field} = $${paramCount++}`);
        values.push(updates[field as keyof Task]);
      }
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    const query = `
      UPDATE tasks
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  async delete(id: string): Promise<boolean> {
    const query = 'DELETE FROM tasks WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rowCount !== null && result.rowCount > 0;
  }

  async recordStatusChange(
    taskId: string,
    fromStatus: string | null,
    toStatus: string,
    changedBy: string
  ): Promise<void> {
    const query = `
      INSERT INTO task_status_history (task_id, from_status, to_status, changed_by)
      VALUES ($1, $2, $3, $4)
    `;
    await pool.query(query, [taskId, fromStatus, toStatus, changedBy]);
  }
}
