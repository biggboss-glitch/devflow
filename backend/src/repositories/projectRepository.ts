import pool from '../config/database';
import { Project } from '../models/types';

export class ProjectRepository {
  async create(data: {
    team_id: string;
    name: string;
    description?: string;
    github_repo_url?: string;
  }): Promise<Project> {
    const query = `
      INSERT INTO projects (team_id, name, description, github_repo_url)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const values = [data.team_id, data.name, data.description || null, data.github_repo_url || null];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  async findAll(limit = 50, offset = 0): Promise<Project[]> {
    const query = `
      SELECT * FROM projects
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2
    `;
    const result = await pool.query(query, [limit, offset]);
    return result.rows;
  }

  async findById(id: string): Promise<Project | null> {
    const query = 'SELECT * FROM projects WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  async findByTeam(teamId: string): Promise<Project[]> {
    const query = `
      SELECT * FROM projects
      WHERE team_id = $1
      ORDER BY created_at DESC
    `;
    const result = await pool.query(query, [teamId]);
    return result.rows;
  }

  async search(searchTerm: string, teamId?: string): Promise<Project[]> {
    let query = `
      SELECT * FROM projects
      WHERE LOWER(name) LIKE LOWER($1)
    `;
    const values: any[] = [`%${searchTerm}%`];

    if (teamId) {
      query += ' AND team_id = $2';
      values.push(teamId);
    }

    query += ' ORDER BY created_at DESC';
    const result = await pool.query(query, values);
    return result.rows;
  }

  async update(
    id: string,
    updates: Partial<Pick<Project, 'name' | 'description' | 'github_repo_url'>>
  ): Promise<Project | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (updates.name !== undefined) {
      fields.push(`name = $${paramCount++}`);
      values.push(updates.name);
    }
    if (updates.description !== undefined) {
      fields.push(`description = $${paramCount++}`);
      values.push(updates.description);
    }
    if (updates.github_repo_url !== undefined) {
      fields.push(`github_repo_url = $${paramCount++}`);
      values.push(updates.github_repo_url);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    const query = `
      UPDATE projects
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  async delete(id: string): Promise<boolean> {
    const query = 'DELETE FROM projects WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rowCount !== null && result.rowCount > 0;
  }
}
