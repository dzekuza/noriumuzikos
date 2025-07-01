console.log('Starting server...');

import express from 'express';
import dotenv from 'dotenv';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Set up Postgres connection pool
let pool;
try {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
  console.log('Postgres pool created');
} catch (err) {
  console.error('Error creating Postgres pool:', err);
  process.exit(1);
}

// Set up Drizzle ORM
let db;
try {
  db = drizzle(pool);
  console.log('Drizzle ORM initialized');
} catch (err) {
  console.error('Error initializing Drizzle ORM:', err);
  process.exit(1);
}

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.status(200).json({ status: 'ok', db: 'connected' });
  } catch (error: any) {
    res.status(500).json({ status: 'error', db: 'disconnected', error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception thrown:', err);
  process.exit(1);
}); 