import fs from 'fs';
import path from 'path';
import pool from '../config/database';

async function runMigrations() {
  try {
    console.log('Starting database migrations...');

    // Get all migration files
    const migrationsDir = path.join(__dirname);
    const files = fs
      .readdirSync(migrationsDir)
      .filter((file) => file.endsWith('.sql'))
      .sort();

    // Run each migration
    for (const file of files) {
      console.log(`Running migration: ${file}`);
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');
      await pool.query(sql);
      console.log(`✓ Completed: ${file}`);
    }

    console.log('All migrations completed successfully!');
    
    // Test database connection
    const result = await pool.query('SELECT NOW()');
    console.log('Database connection test:', result.rows[0]);
    
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigrations();
