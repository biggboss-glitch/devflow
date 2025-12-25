import pool from '../config/database';

export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    const result = await pool.query('SELECT NOW()');
    console.log('Database health check passed:', result.rows[0].now);
    return true;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
}

export async function testConnection() {
  try {
    const client = await pool.connect();
    console.log('Successfully connected to database');
    client.release();
    return true;
  } catch (error) {
    console.error('Failed to connect to database:', error);
    return false;
  }
}
