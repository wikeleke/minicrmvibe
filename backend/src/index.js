import dotenv from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';
import express from 'express';
import cors from 'cors';
import { connectDB, dbReady } from './db.js';
import contactsRouter from './routes/contacts.js';
import usersRouter from './routes/users.js';
import chatRouter from './routes/chat.js';

const cwd = process.cwd();
const envPath = fs.existsSync(path.join(cwd, '.env'))
  ? path.join(cwd, '.env')
  : fs.existsSync(path.join(cwd, '.ENV'))
    ? path.join(cwd, '.ENV')
    : null;

if (envPath) dotenv.config({ path: envPath });
else dotenv.config();

const app = express();
const PORT = process.env.PORT ?? 3000;
const FRONTEND_URL = process.env.FRONTEND_URL || '';
const CORS_ORIGINS = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);
const allowedOrigins = new Set([
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  FRONTEND_URL.trim(),
  ...CORS_ORIGINS,
].filter(Boolean));

function isVercelOrigin(origin) {
  try {
    const { protocol, hostname } = new URL(origin);
    return protocol === 'https:' && hostname.endsWith('.vercel.app');
  } catch {
    return false;
  }
}

function isAllowedOrigin(origin) {
  if (!origin) return true;
  if (allowedOrigins.has(origin)) return true;
  if (isVercelOrigin(origin)) return true;
  return false;
}

app.use(cors({
  origin(origin, callback) {
    if (isAllowedOrigin(origin)) return callback(null, true);
    return callback(new Error(`Origen no permitido por CORS: ${origin}`));
  },
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'x-user-role'],
}));
app.use(express.json());
app.get('/api/health', (req, res) => {
  res.json({ ok: true, db: dbReady() ? 'connected' : 'disconnected' });
});
app.use((req, res, next) => {
  if (!dbReady()) return res.status(503).json({ error: 'Base de datos no conectada' });
  return next();
});
app.use('/api/contacts', contactsRouter);
app.use('/api/users', usersRouter);
app.use('/api/chat', chatRouter);

async function startServer() {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`API en http://localhost:${PORT}`);
      console.log('MongoDB conectado');
    });
  } catch (err) {
    console.error('No se pudo iniciar el servidor:', err.message);
    process.exit(1);
  }
}

startServer();
