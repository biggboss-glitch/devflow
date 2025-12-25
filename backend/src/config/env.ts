import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables
dotenv.config();

// Environment variable validation schema
const envSchema = z.object({
  // Application
  NODE_ENV: z.enum(['development', 'staging', 'production', 'test']).default('development'),
  PORT: z.string().regex(/^\d+$/).transform(Number).default('5000'),
  APP_NAME: z.string().default('devflow-backend'),
  APP_VERSION: z.string().default('1.0.0'),

  // Database
  DB_HOST: z.string().default('localhost'),
  DB_PORT: z.string().regex(/^\d+$/).transform(Number).default('5432'),
  DB_NAME: z.string().default('devflow'),
  DB_USER: z.string().default('postgres'),
  DB_PASSWORD: z.string().min(1, 'DB_PASSWORD is required'),
  DB_CONNECTION_STRING: z.string().optional(),
  DB_POOL_MAX: z.string().regex(/^\d+$/).transform(Number).optional(),
  DB_POOL_IDLE_TIMEOUT_MS: z.string().regex(/^\d+$/).transform(Number).optional(),
  DB_POOL_CONNECTION_TIMEOUT_MS: z.string().regex(/^\d+$/).transform(Number).optional(),
  DB_SSL_ENABLED: z.string().transform((val) => val === 'true').optional(),

  // JWT
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('30d'),
  JWT_ISSUER: z.string().optional(),
  JWT_AUDIENCE: z.string().optional(),

  // CORS
  FRONTEND_URL: z.string().url().default('http://localhost:5173'),
  CORS_CREDENTIALS: z.string().transform((val) => val !== 'false').default('true'),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.string().regex(/^\d+$/).transform(Number).default('900000'),
  RATE_LIMIT_MAX_REQUESTS: z.string().regex(/^\d+$/).transform(Number).default('100'),

  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly']).default('info'),
  LOG_DIR: z.string().optional(),
  LOG_FILE_ENABLED: z.string().transform((val) => val !== 'false').optional(),
  LOG_CONSOLE_ENABLED: z.string().transform((val) => val !== 'false').optional(),

  // GitHub
  GITHUB_TOKEN: z.string().optional(),
  GITHUB_API_URL: z.string().url().optional(),

  // Security
  HELMET_ENABLED: z.string().transform((val) => val !== 'false').default('true'),
  TRUST_PROXY: z.string().transform((val) => val === 'true').default('false'),

  // Swagger
  SWAGGER_ENABLED: z.string().transform((val) => val !== 'false').optional(),

  // WebSocket
  WS_CORS_ORIGIN: z.string().url().optional(),
  WS_PING_INTERVAL: z.string().regex(/^\d+$/).transform(Number).optional(),
  WS_PING_TIMEOUT: z.string().regex(/^\d+$/).transform(Number).optional(),
});

// Validate environment variables
let env: z.infer<typeof envSchema>;

try {
  env = envSchema.parse(process.env);
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error('❌ Environment variable validation failed:');
    error.errors.forEach((err) => {
      console.error(`  - ${err.path.join('.')}: ${err.message}`);
    });
    console.error('\nPlease check your .env file and ensure all required variables are set correctly.');
    process.exit(1);
  }
  throw error;
}

// Production environment checks
if (env.NODE_ENV === 'production') {
  const warnings: string[] = [];

  if (env.JWT_SECRET.includes('change-this') || env.JWT_SECRET.length < 32) {
    warnings.push('JWT_SECRET appears to be insecure or too short');
  }

  if (env.JWT_REFRESH_SECRET.includes('change-this') || env.JWT_REFRESH_SECRET.length < 32) {
    warnings.push('JWT_REFRESH_SECRET appears to be insecure or too short');
  }

  if (env.DB_PASSWORD.length < 12) {
    warnings.push('DB_PASSWORD appears to be too short for production');
  }

  if (env.FRONTEND_URL.includes('localhost')) {
    warnings.push('FRONTEND_URL should not point to localhost in production');
  }

  if (env.SWAGGER_ENABLED !== false) {
    warnings.push('SWAGGER_ENABLED should be false in production');
  }

  if (env.DB_SSL_ENABLED !== true) {
    warnings.push('DB_SSL_ENABLED should be true in production');
  }

  if (warnings.length > 0) {
    console.warn('⚠️  Production environment warnings:');
    warnings.forEach((warning) => console.warn(`  - ${warning}`));
    console.warn('');
  }
}

// Export configuration object
export const config = {
  nodeEnv: env.NODE_ENV,
  port: env.PORT,
  app: {
    name: env.APP_NAME,
    version: env.APP_VERSION,
  },
  database: {
    host: env.DB_HOST,
    port: env.DB_PORT,
    name: env.DB_NAME,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    connectionString: env.DB_CONNECTION_STRING,
    pool: {
      max: env.DB_POOL_MAX ?? 20,
      idleTimeoutMillis: env.DB_POOL_IDLE_TIMEOUT_MS ?? 30000,
      connectionTimeoutMillis: env.DB_POOL_CONNECTION_TIMEOUT_MS ?? 2000,
    },
    ssl: env.DB_SSL_ENABLED ?? false,
  },
  jwt: {
    secret: env.JWT_SECRET,
    expiresIn: env.JWT_EXPIRES_IN,
    refreshSecret: env.JWT_REFRESH_SECRET,
    refreshExpiresIn: env.JWT_REFRESH_EXPIRES_IN,
    issuer: env.JWT_ISSUER,
    audience: env.JWT_AUDIENCE,
  },
  github: {
    token: env.GITHUB_TOKEN || '',
    apiUrl: env.GITHUB_API_URL || 'https://api.github.com',
  },
  cors: {
    origin: env.FRONTEND_URL,
    credentials: env.CORS_CREDENTIALS,
  },
  rateLimit: {
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    maxRequests: env.RATE_LIMIT_MAX_REQUESTS,
  },
  logging: {
    level: env.LOG_LEVEL,
    dir: env.LOG_DIR || './logs',
    fileEnabled: env.LOG_FILE_ENABLED ?? true,
    consoleEnabled: env.LOG_CONSOLE_ENABLED ?? true,
  },
  security: {
    helmetEnabled: env.HELMET_ENABLED,
    trustProxy: env.TRUST_PROXY,
  },
  swagger: {
    enabled: env.SWAGGER_ENABLED ?? env.NODE_ENV !== 'production',
  },
  websocket: {
    corsOrigin: env.WS_CORS_ORIGIN || env.FRONTEND_URL,
    pingInterval: env.WS_PING_INTERVAL ?? 25000,
    pingTimeout: env.WS_PING_TIMEOUT ?? 60000,
  },
} as const;

// Type export for TypeScript
export type Config = typeof config;
