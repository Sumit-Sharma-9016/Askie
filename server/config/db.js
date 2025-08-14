import mongoose from 'mongoose';

export async function connectDB(uri) {
  if (!uri) throw new Error('MONGODB_URI is missing');
  await mongoose.connect(uri, { dbName: 'askie' });
  console.log('✅ MongoDB connected');
}