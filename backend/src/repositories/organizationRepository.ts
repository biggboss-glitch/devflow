import pool from '../config/database';
import { Organization } from '../models/types';

export class OrganizationRepository {
  async create(data: { name: string; description?: string }): Promise<Organization> {
    const query = `
      INSERT INTO organizations (name, description)
      VALUES ($1, $2)
      RETURNING *
    `;
    const values = [data.name, data.description || null];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  async findAll(limit = 50, offset = 0): Promise<Organization[]> {
    const query = `
      SELECT * FROM organizations
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2
    `;
    const result = await pool.query(query, [limit, offset]);
    return result.rows;
  }

  async findById(id: string): Promise<Organization | null> {
    const query = 'SELECT * FROM organizations WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  async update(
    id: string,
    updates: Partial<Pick<Organization, 'name' | 'description'>>
  ): Promise<Organization | null> {
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
      UPDATE organizations
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  async delete(id: string): Promise<boolean> {
    const query = 'DELETE FROM organizations WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rowCount !== null && result.rowCount > 0;
  }

  async count(): Promise<number> {
    const query = 'SELECT COUNT(*) FROM organizations';
    const result = await pool.query(query);
    return parseInt(result.rows[0].count);
  }
}
