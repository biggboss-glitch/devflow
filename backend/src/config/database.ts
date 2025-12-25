import { Pool, PoolConfig } from 'pg';
import { config } from './env';

const poolConfig: PoolConfig = {
  host: config.database.host,
  port: config.database.port,
  database: config.database.name,
  user: config.database.user,
  password: config.database.password,
  max: config.database.pool.max,
  idleTimeoutMillis: config.database.pool.idleTimeoutMillis,
  connectionTimeoutMillis: config.database.pool.connectionTimeoutMillis,
};

// Use connection string if provided (takes precedence)
if (config.database.connectionString) {
  poolConfig.connectionString = config.database.connectionString;
}

// SSL configuration
if (config.database.ssl) {
  poolConfig.ssl = {
    rejectUnauthorized: config.nodeEnv === 'production',
  };
}

const pool = new Pool(poolConfig);

pool.on('error', (err) => {
  console.error('Unexpected database error:', err);
});

export default pool;
