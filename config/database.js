const path = require('path');

/**
 * Parse DATABASE_URL and extract individual connection parameters
 * Format: postgresql://user:password@host:port/database?options
 */
function parseDatabaseUrl(url) {
  if (!url) return null;
  
  try {
    const parsed = new URL(url);
    return {
      host: parsed.hostname,
      port: parseInt(parsed.port, 10) || 5432,
      database: parsed.pathname.slice(1), // Remove leading /
      user: parsed.username,
      password: decodeURIComponent(parsed.password), // Handle special characters
      ssl: parsed.searchParams.get('sslmode') === 'require' || 
           parsed.searchParams.get('ssl') === 'true',
    };
  } catch (error) {
    console.error('[Database] Failed to parse DATABASE_URL:', error.message);
    return null;
  }
}

module.exports = ({ env }) => {
  const databaseUrl = env('DATABASE_URL');
  const parsedUrl = parseDatabaseUrl(databaseUrl);
  
  // Auto-detect client: if DATABASE_URL is set and parsed, use postgres
  const client = parsedUrl ? 'postgres' : env('DATABASE_CLIENT', 'sqlite');

  const connections = {
    mysql: {
      connection: {
        host: env('DATABASE_HOST', 'localhost'),
        port: env.int('DATABASE_PORT', 3306),
        database: env('DATABASE_NAME', 'strapi'),
        user: env('DATABASE_USERNAME', 'strapi'),
        password: env('DATABASE_PASSWORD', 'strapi'),
        ssl: env.bool('DATABASE_SSL', false) && {
          key: env('DATABASE_SSL_KEY', undefined),
          cert: env('DATABASE_SSL_CERT', undefined),
          ca: env('DATABASE_SSL_CA', undefined),
          capath: env('DATABASE_SSL_CAPATH', undefined),
          cipher: env('DATABASE_SSL_CIPHER', undefined),
          rejectUnauthorized: env.bool('DATABASE_SSL_REJECT_UNAUTHORIZED', true),
        },
      },
      pool: { min: env.int('DATABASE_POOL_MIN', 2), max: env.int('DATABASE_POOL_MAX', 10) },
    },
    postgres: {
      connection: {
        // If DATABASE_URL is parsed, use those values; otherwise use individual env vars
        host: parsedUrl?.host || env('DATABASE_HOST', 'localhost'),
        port: parsedUrl?.port || env.int('DATABASE_PORT', 5432),
        database: parsedUrl?.database || env('DATABASE_NAME', 'strapi'),
        user: parsedUrl?.user || env('DATABASE_USERNAME', 'strapi'),
        password: parsedUrl?.password || env('DATABASE_PASSWORD', 'strapi'),
        ssl: (parsedUrl?.ssl || env.bool('DATABASE_SSL', false)) ? {
          rejectUnauthorized: env.bool('DATABASE_SSL_REJECT_UNAUTHORIZED', false),
        } : false,
        schema: env('DATABASE_SCHEMA', 'public'),
      },
      pool: { min: env.int('DATABASE_POOL_MIN', 2), max: env.int('DATABASE_POOL_MAX', 10) },
    },
    sqlite: {
      connection: {
        filename: path.join(__dirname, '..', env('DATABASE_FILENAME', '.tmp/data.db')),
      },
      useNullAsDefault: true,
    },
  };

  // Log which database is being used (helpful for debugging)
  if (parsedUrl) {
    console.log(`[Database] Using PostgreSQL - Host: ${parsedUrl.host}, Database: ${parsedUrl.database}`);
  } else {
    console.log(`[Database] Using client: ${client}`);
  }

  return {
    connection: {
      client,
      ...connections[client],
      acquireConnectionTimeout: env.int('DATABASE_CONNECTION_TIMEOUT', 60000),
    },
  };
};
