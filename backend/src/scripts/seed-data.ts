import pool from '../config/database';
import { AuthService } from '../services/authService';

const authService = new AuthService();

async function seedDatabase() {
  try {
    console.log('Starting database seeding...');

    // Test users
    const testUsers = [
      {
        email: 'arnoldswamy09@gmail.com',
        password: 'password123',
        name: 'Arnold Swamy',
        role: 'admin',
      },
      {
        email: 'test@devflow.com',
        password: 'test123',
        name: 'Test User',
        role: 'developer',
      },
      {
        email: 'manager@devflow.com',
        password: 'manager123',
        name: 'Project Manager',
        role: 'team_lead',
      },
    ];

    for (const userData of testUsers) {
      // Check if user already exists
      const result = await pool.query('SELECT id FROM users WHERE email = $1', [userData.email]);
      
      if (result.rows.length === 0) {
        // Hash password
        const password_hash = await authService.hashPassword(userData.password);

        // Insert user
        await pool.query(
          'INSERT INTO users (email, password_hash, name, role, created_at, updated_at) VALUES ($1, $2, $3, $4, NOW(), NOW())',
          [userData.email, password_hash, userData.name, userData.role]
        );

        console.log(`✓ Created user: ${userData.email}`);
      } else {
        console.log(`⊘ User already exists: ${userData.email}`);
      }
    }

    console.log('Database seeding completed!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seedDatabase();
