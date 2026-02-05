import dotenv from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';
import express from 'express';
import cors from 'cors';
import { connectDB, dbReady } from './db.js';
import contactsRouter from './routes/contacts.js';
import usersRouter from './routes/users.js';

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

app.use(cors());
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
