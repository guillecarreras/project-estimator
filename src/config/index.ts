import * as path from 'path';
import * as fs from 'fs';

interface Config {
  // Application
  nodeEnv: 'development' | 'production' | 'test';
  port: number;
  logLevel: string;
  appName: string;
  appVersion: string;

  // Database
  database: {
    host: string;
    port: number;
    name: string;
    user: string;
    password: string;
    url: string;
    maxConnections: number;
    connectionTimeout: number;
    idleTimeout: number;
  };

  // Redis
  redis: {
    host: string;
    port: number;
    password: string;
    url: string;
    db: number;
    ttl: number;
  };

  // Security
  security: {
    jwtSecret: string;
    jwtExpiresIn: string;
    apiKey: string;
    sessionSecret: string;
    enableHttps: boolean;
    corsOrigin: string[];
    corsCredentials: boolean;
  };

  // Rate Limiting
  rateLimit: {
    enabled: boolean;
    windowMs: number;
    maxRequests: number;
    message: string;
  };

  // Monitoring
  monitoring: {
    enableMetrics: boolean;
    metricsPort: number;
    sentryDsn?: string;
    logFormat: 'json' | 'text';
  };

  // Features
  features: {
    exportPdf: boolean;
    exportExcel: boolean;
    googleDocsExport: boolean;
    slackIntegration: boolean;
  };

  // Cache
  cache: {
    enabled: boolean;
    ttl: number;
  };

  // Server
  server: {
    gracefulShutdownTimeout: number;
    healthCheckInterval: number;
    maxBodySize: string;
  };
}

class ConfigManager {
  private config: Config;

  constructor() {
    this.config = this.loadConfig();
    this.validateConfig();
  }

  private loadConfig(): Config {
    const nodeEnv = (process.env.NODE_ENV || 'development') as 'development' | 'production' | 'test';

    return {
      nodeEnv,
      port: parseInt(process.env.PORT || '3000', 10),
      logLevel: process.env.LOG_LEVEL || (nodeEnv === 'production' ? 'warn' : 'info'),
      appName: 'project-estimator',
      appVersion: this.getAppVersion(),

      database: {
        host: process.env.DB_HOST || 'postgres',
        port: parseInt(process.env.DB_PORT || '5432', 10),
        name: process.env.DB_NAME || 'project_estimator',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        url: process.env.DATABASE_URL || this.buildDatabaseUrl(),
        maxConnections: parseInt(process.env.DB_MAX_CONNECTIONS || '20', 10),
        connectionTimeout: parseInt(process.env.DB_CONNECTION_TIMEOUT || '5000', 10),
        idleTimeout: parseInt(process.env.DB_IDLE_TIMEOUT || '30000', 10),
      },

      redis: {
        host: process.env.REDIS_HOST || 'redis',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
        password: process.env.REDIS_PASSWORD || 'redis_password',
        url: process.env.REDIS_URL || this.buildRedisUrl(),
        db: parseInt(process.env.REDIS_DB || '0', 10),
        ttl: parseInt(process.env.CACHE_TTL || '3600', 10),
      },

      security: {
        jwtSecret: process.env.JWT_SECRET || 'your-secret-key-change-this',
        jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
        apiKey: process.env.API_KEY || 'your-api-key-change-this',
        sessionSecret: process.env.SESSION_SECRET || 'your-session-secret',
        enableHttps: process.env.ENABLE_HTTPS === 'true',
        corsOrigin: (process.env.CORS_ORIGIN || 'http://localhost:3000').split(','),
        corsCredentials: process.env.CORS_CREDENTIALS === 'true',
      },

      rateLimit: {
        enabled: process.env.ENABLE_RATE_LIMITING === 'true',
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
        maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
        message: 'Too many requests from this IP, please try again later.',
      },

      monitoring: {
        enableMetrics: process.env.ENABLE_METRICS === 'true',
        metricsPort: parseInt(process.env.METRICS_PORT || '9090', 10),
        sentryDsn: process.env.SENTRY_DSN,
        logFormat: (process.env.LOG_FORMAT || 'json') as 'json' | 'text',
      },

      features: {
        exportPdf: process.env.ENABLE_EXPORT_PDF !== 'false',
        exportExcel: process.env.ENABLE_EXPORT_EXCEL !== 'false',
        googleDocsExport: process.env.ENABLE_GOOGLE_DOCS_EXPORT === 'true',
        slackIntegration: process.env.ENABLE_SLACK_INTEGRATION === 'true',
      },

      cache: {
        enabled: process.env.CACHE_ENABLED === 'true',
        ttl: parseInt(process.env.CACHE_TTL || '3600', 10),
      },

      server: {
        gracefulShutdownTimeout: parseInt(process.env.GRACEFUL_SHUTDOWN_TIMEOUT || '30000', 10),
        healthCheckInterval: parseInt(process.env.HEALTH_CHECK_INTERVAL || '30000', 10),
        maxBodySize: process.env.MAX_BODY_SIZE || '50mb',
      },
    };
  }

  private buildDatabaseUrl(): string {
    const host = process.env.DB_HOST || 'postgres';
    const port = process.env.DB_PORT || '5432';
    const name = process.env.DB_NAME || 'project_estimator';
    const user = process.env.DB_USER || 'postgres';
    const password = process.env.DB_PASSWORD || 'postgres';
    return `postgresql://${user}:${password}@${host}:${port}/${name}`;
  }

  private buildRedisUrl(): string {
    const host = process.env.REDIS_HOST || 'redis';
    const port = process.env.REDIS_PORT || '6379';
    const password = process.env.REDIS_PASSWORD || 'redis_password';
    return `redis://:${password}@${host}:${port}`;
  }

  private getAppVersion(): string {
    try {
      const packageJsonPath = path.join(__dirname, '../../package.json');
      if (fs.existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
        return packageJson.version || '0.0.0';
      }
    } catch (error) {
      console.error('Failed to read package.json version');
    }
    return '0.0.0';
  }

  private validateConfig(): void {
    const errors: string[] = [];

    // Validate critical config values
    if (!this.config.security.jwtSecret || this.config.security.jwtSecret.includes('change-this')) {
      if (this.config.nodeEnv === 'production') {
        errors.push('JWT_SECRET must be set to a secure value in production');
      }
    }

    if (!this.config.security.apiKey || this.config.security.apiKey.includes('change-this')) {
      if (this.config.nodeEnv === 'production') {
        errors.push('API_KEY must be set to a secure value in production');
      }
    }

    if (this.config.database.password === 'postgres' && this.config.nodeEnv === 'production') {
      errors.push('Database password must be changed in production');
    }

    if (errors.length > 0) {
      throw new Error(`Configuration validation failed:\n${errors.join('\n')}`);
    }
  }

  get(): Config {
    return this.config;
  }

  isDevelopment(): boolean {
    return this.config.nodeEnv === 'development';
  }

  isProduction(): boolean {
    return this.config.nodeEnv === 'production';
  }

  isTest(): boolean {
    return this.config.nodeEnv === 'test';
  }
}

export const configManager = new ConfigManager();
export const config = configManager.get();
export default config;
