#!/usr/bin/env ts-node
/**
 * Environment Variable Validation Script
 * 
 * Validates that all required environment variables are set correctly.
 * Run this script before starting the server in production.
 * 
 * Usage: npm run validate-env
 */

import dotenv from 'dotenv';
import { existsSync } from 'fs';
import { join } from 'path';

// Load .env file
const envPath = join(__dirname, '..', '.env');
if (existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  console.warn('⚠️  No .env file found. Using environment variables from system.');
}

interface EnvCheck {
  name: string;
  required: boolean;
  validator?: (value: string | undefined) => boolean | string;
  description: string;
}

const checks: EnvCheck[] = [
  {
    name: 'NODE_ENV',
    required: true,
    validator: (val) => ['development', 'staging', 'production', 'test'].includes(val || ''),
    description: 'Environment (development | staging | production | test)',
  },
  {
    name: 'PORT',
    required: true,
    validator: (val) => /^\d+$/.test(val || ''),
    description: 'Server port number',
  },
  {
    name: 'DB_HOST',
    required: true,
    description: 'Database host',
  },
  {
    name: 'DB_PORT',
    required: true,
    validator: (val) => /^\d+$/.test(val || ''),
    description: 'Database port',
  },
  {
    name: 'DB_NAME',
    required: true,
    description: 'Database name',
  },
  {
    name: 'DB_USER',
    required: true,
    description: 'Database user',
  },
  {
    name: 'DB_PASSWORD',
    required: true,
    validator: (val) => {
      if (!val || val.length < 8) {
        return 'Password must be at least 8 characters';
      }
      if (val.includes('change-this') || val.includes('your_')) {
        return 'Password appears to be a placeholder';
      }
      return true;
    },
    description: 'Database password (min 8 chars, no placeholders)',
  },
  {
    name: 'JWT_SECRET',
    required: true,
    validator: (val) => {
      if (!val || val.length < 32) {
        return 'JWT_SECRET must be at least 32 characters';
      }
      if (val.includes('change-this') || val.includes('your_')) {
        return 'JWT_SECRET appears to be a placeholder';
      }
      return true;
    },
    description: 'JWT secret key (min 32 chars)',
  },
  {
    name: 'JWT_REFRESH_SECRET',
    required: true,
    validator: (val) => {
      if (!val || val.length < 32) {
        return 'JWT_REFRESH_SECRET must be at least 32 characters';
      }
      if (val.includes('change-this') || val.includes('your_')) {
        return 'JWT_REFRESH_SECRET appears to be a placeholder';
      }
      return true;
    },
    description: 'JWT refresh secret key (min 32 chars)',
  },
  {
    name: 'FRONTEND_URL',
    required: true,
    validator: (val) => {
      try {
        new URL(val || '');
        return true;
      } catch {
        return 'Must be a valid URL';
      }
    },
    description: 'Frontend URL for CORS',
  },
];

function validateEnv(): boolean {
  console.log('🔍 Validating environment variables...\n');

  const errors: string[] = [];
  const warnings: string[] = [];

  checks.forEach((check) => {
    const value = process.env[check.name];

    if (check.required && !value) {
      errors.push(`❌ ${check.name}: Required but not set - ${check.description}`);
      return;
    }

    if (value && check.validator) {
      const result = check.validator(value);
      if (result !== true) {
        errors.push(`❌ ${check.name}: ${result} - ${check.description}`);
        return;
      }
    }

    if (value) {
      // Mask sensitive values
      const displayValue = ['DB_PASSWORD', 'JWT_SECRET', 'JWT_REFRESH_SECRET', 'GITHUB_TOKEN'].includes(check.name)
        ? '***' + value.slice(-4)
        : value;
      console.log(`✅ ${check.name}: ${displayValue}`);
    }
  });

  // Production-specific checks
  if (process.env.NODE_ENV === 'production') {
    console.log('\n🔒 Production environment checks:');

    if (process.env.DB_SSL_ENABLED !== 'true') {
      warnings.push('⚠️  DB_SSL_ENABLED should be "true" in production');
    }

    if (process.env.FRONTEND_URL?.includes('localhost')) {
      warnings.push('⚠️  FRONTEND_URL should not point to localhost in production');
    }

    if (process.env.SWAGGER_ENABLED === 'true') {
      warnings.push('⚠️  SWAGGER_ENABLED should be "false" in production');
    }

    if (process.env.TRUST_PROXY !== 'true') {
      warnings.push('⚠️  TRUST_PROXY should be "true" if behind a reverse proxy');
    }

    if (process.env.LOG_LEVEL === 'debug' || process.env.LOG_LEVEL === 'silly') {
      warnings.push('⚠️  LOG_LEVEL should be "info" or "warn" in production');
    }
  }

  console.log('');

  if (warnings.length > 0) {
    warnings.forEach((warning) => console.warn(warning));
    console.log('');
  }

  if (errors.length > 0) {
    console.error('❌ Validation failed with the following errors:\n');
    errors.forEach((error) => console.error(error));
    console.error('\nPlease fix these issues before starting the server.');
    return false;
  }

  console.log('✅ All environment variables are valid!\n');
  return true;
}

// Run validation
const isValid = validateEnv();
process.exit(isValid ? 0 : 1);

