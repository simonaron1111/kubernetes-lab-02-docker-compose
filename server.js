const express = require('express');
const { Pool } = require('pg');

const app = express();
const port = Number(process.env.PORT || 8080);
const pool = new Pool({
  host: process.env.DB_HOST || 'database',
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME || 'notes',
  user: process.env.DB_USER || 'notes_app',
  password: process.env.DB_PASSWORD || 'change-me-for-production'
});

app.use(express.json());

app.get('/', async (_request, response, next) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, text, created_at FROM notes ORDER BY id ASC'
    );
    response.json({ notes: rows });
  } catch (error) {
    next(error);
  }
});

app.post('/notes', async (request, response, next) => {
  const text = typeof request.body?.text === 'string' ? request.body.text.trim() : '';
  if (!text) {
    return response.status(400).json({ error: 'text is required' });
  }

  try {
    const { rows } = await pool.query(
      'INSERT INTO notes (text) VALUES ($1) RETURNING id, text, created_at',
      [text]
    );
    return response.status(201).json(rows[0]);
  } catch (error) {
    return next(error);
  }
});

app.get('/health', async (_request, response) => {
  try {
    await pool.query('SELECT 1');
    response.status(200).json({ status: 'ok' });
  } catch (error) {
    response.status(503).json({ status: 'database unavailable' });
  }
});

app.use((error, _request, response, _next) => {
  console.error(error);
  response.status(500).json({ error: 'internal server error' });
});

let server;

async function start() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS notes (
      id SERIAL PRIMARY KEY,
      text TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  server = app.listen(port, '0.0.0.0', () => {
    console.log(`Server listening on port ${port}`);
  });
}

function shutdown(signal) {
  console.log(`Received ${signal}; shutting down.`);
  if (!server) {
    return pool.end(() => process.exit(0));
  }
  server.close(() => pool.end(() => process.exit(0)));
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

start().catch((error) => {
  console.error('Unable to initialize database:', error);
  process.exit(1);
});
