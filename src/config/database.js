import mongoose from 'mongoose';

/**
 * Establish a connection to MongoDB using the URI from the environment.
 * The function is idempotent and can be imported across the codebase.
 */
export const connectToDatabase = async () => {
  const { MONGODB_URI } = process.env;

  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI environment variable is not set.');
  }

  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000
    });
    // The connection is reused by mongoose across imports, so no need to return it.
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    throw error;
  }
};

export default mongoose;
