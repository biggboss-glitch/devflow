import pool from '../config/database';
import { Sprint } from '../models/types';

export class SprintRepository {
  async create(data: {
    project_id: string;
    name: string;
    goal?: string;
    start_date: Date;
    end_date: Date;
  }): Promise<Sprint> {
    const query = `
      INSERT INTO sprints (project_id, name, goal, start_date, end_date, status)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const status = this.calculateStatus(data.start_date, data.end_date);
    const values = [
      data.project_id,
      data.name,
      data.goal || null,
      data.start_date,
      data.end_date,
      status,
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  async findAll(limit = 50, offset = 0): Promise<Sprint[]> {
    const query = `
      SELECT * FROM sprints
      ORDER BY start_date DESC
      LIMIT $1 OFFSET $2
    `;
    const result = await pool.query(query, [limit, offset]);
    return result.rows;
  }

  async findById(id: string): Promise<Sprint | null> {
    const query = 'SELECT * FROM sprints WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  async findByProject(projectId: string): Promise<Sprint[]> {
    const query = `
      SELECT * FROM sprints
      WHERE project_id = $1
      ORDER BY start_date DESC
    `;
    const result = await pool.query(query, [projectId]);
    return result.rows;
  }

  async update(
    id: string,
    updates: Partial<Pick<Sprint, 'name' | 'goal' | 'start_date' | 'end_date' | 'status'>>
  ): Promise<Sprint | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (updates.name !== undefined) {
      fields.push(`name = $${paramCount++}`);
      values.push(updates.name);
    }
    if (updates.goal !== undefined) {
      fields.push(`goal = $${paramCount++}`);
      values.push(updates.goal);
    }
    if (updates.start_date !== undefined) {
      fields.push(`start_date = $${paramCount++}`);
      values.push(updates.start_date);
    }
    if (updates.end_date !== undefined) {
      fields.push(`end_date = $${paramCount++}`);
      values.push(updates.end_date);
    }
    if (updates.status !== undefined) {
      fields.push(`status = $${paramCount++}`);
      values.push(updates.status);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    const query = `
      UPDATE sprints
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  async delete(id: string): Promise<boolean> {
    const query = 'DELETE FROM sprints WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rowCount !== null && result.rowCount > 0;
  }

  private calculateStatus(startDate: Date, endDate: Date): string {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (now < start) {
      return 'planned';
    } else if (now >= start && now <= end) {
      return 'active';
    } else {
      return 'completed';
    }
  }

  async updateSprintStatuses(): Promise<void> {
    const query = `
      UPDATE sprints
      SET status = CASE
        WHEN CURRENT_DATE < start_date THEN 'planned'
        WHEN CURRENT_DATE BETWEEN start_date AND end_date THEN 'active'
        WHEN CURRENT_DATE > end_date THEN 'completed'
      END
      WHERE status != CASE
        WHEN CURRENT_DATE < start_date THEN 'planned'
        WHEN CURRENT_DATE BETWEEN start_date AND end_date THEN 'active'
        WHEN CURRENT_DATE > end_date THEN 'completed'
      END
    `;
    await pool.query(query);
  }
}
