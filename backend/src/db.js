import mongoose from 'mongoose';

export async function connectDB() {
  const uri = process.env.MONGODB_URI_STD || process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI o MONGODB_URI_STD no definida en .env/.ENV');
  await mongoose.connect(uri);
  console.log('MongoDB Atlas conectado');
}
