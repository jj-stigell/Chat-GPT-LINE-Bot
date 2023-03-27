import mongoose, { ConnectOptions } from 'mongoose';

import { MONGODB_URI } from '../configs/environment';

const MONDODB_OPTIONS: ConnectOptions = {
  ssl: true,
  sslValidate: true,
  autoIndex: false,
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 1000,
  socketTimeoutMS: 30000,
  family: 4,
};

export async function connectToDatabase(): Promise<void> {
  try {
    await mongoose.connect(MONGODB_URI, MONDODB_OPTIONS);
    console.log('Connected to MongoDB.');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
}
