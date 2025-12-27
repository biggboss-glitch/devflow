import pool from '../config/database';
import { Team, TeamMember } from '../models/types';

export class TeamRepository {
  async create(data: {
    organization_id: string;
    name: string;
    description?: string;
  }): Promise<Team> {
    const query = `
      INSERT INTO teams (organization_id, name, description)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const values = [data.organization_id, data.name, data.description || null];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  async findAll(limit = 50, offset = 0): Promise<Team[]> {
    const query = `
      SELECT * FROM teams
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2
    `;
    const result = await pool.query(query, [limit, offset]);
    return result.rows;
  }

  async findById(id: string): Promise<Team | null> {
    const query = 'SELECT * FROM teams WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  async findByOrganization(organizationId: string): Promise<Team[]> {
    const query = `
      SELECT * FROM teams
      WHERE organization_id = $1
      ORDER BY created_at DESC
    `;
    const result = await pool.query(query, [organizationId]);
    return result.rows;
  }

  async update(
    id: string,
    updates: Partial<Pick<Team, 'name' | 'description'>>
  ): Promise<Team | null> {
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

    if (fields.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    const query = `
      UPDATE teams
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  async delete(id: string): Promise<boolean> {
    const query = 'DELETE FROM teams WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rowCount !== null && result.rowCount > 0;
  }

  async addMember(teamId: string, userId: string, role: string): Promise<TeamMember> {
    const query = `
      INSERT INTO team_members (team_id, user_id, role)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const result = await pool.query(query, [teamId, userId, role]);
    return result.rows[0];
  }

  async removeMember(teamId: string, userId: string): Promise<boolean> {
    const query = 'DELETE FROM team_members WHERE team_id = $1 AND user_id = $2';
    const result = await pool.query(query, [teamId, userId]);
    return result.rowCount !== null && result.rowCount > 0;
  }

  async getMembers(teamId: string): Promise<any[]> {
    const query = `
      SELECT u.id as user_id, u.id, u.name, u.email, u.avatar_url, tm.role, tm.joined_at
      FROM team_members tm
      JOIN users u ON tm.user_id = u.id
      WHERE tm.team_id = $1
      ORDER BY tm.joined_at DESC
    `;
    const result = await pool.query(query, [teamId]);
    return result.rows;
  }

  async isMember(teamId: string, userId: string): Promise<boolean> {
    const query = 'SELECT 1 FROM team_members WHERE team_id = $1 AND user_id = $2';
    const result = await pool.query(query, [teamId, userId]);
    return result.rows.length > 0;
  }
}
