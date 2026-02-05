import mongoose from 'mongoose';

mongoose.set('bufferCommands', false);

function getUri() {
  return process.env.MONGODB_URI_STD || process.env.MONGODB_URI;
}

function normalizeUri(uri) {
  if (!uri || !uri.includes('?')) return uri;
  const [base, query] = uri.split('?', 2);
  const params = new URLSearchParams(query);
  const replicaSet = params.get('replicaSet');
  if (replicaSet && replicaSet.toUpperCase() === 'REPLICA_SET_NAME') {
    params.delete('replicaSet');
    console.warn('replicaSet es placeholder; se omitirá para conectar.');
  }
  const nextQuery = params.toString();
  return nextQuery ? `${base}?${nextQuery}` : base;
}

export function dbReady() {
  return mongoose.connection.readyState === 1;
}

export async function connectDB({ retries = 5, delayMs = 2000 } = {}) {
  const uri = normalizeUri(getUri());
  if (!uri) throw new Error('MONGODB_URI o MONGODB_URI_STD no definida en .env/.ENV');

  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      await mongoose.connect(uri, { dbName: 'minicrm', serverSelectionTimeoutMS: 10000 });
      console.log('MongoDB Atlas conectado');
      return;
    } catch (err) {
      const last = attempt === retries;
      console.error(`Error de conexión a MongoDB (intento ${attempt}/${retries}): ${err.message}`);
      if (last) throw err;
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
}
