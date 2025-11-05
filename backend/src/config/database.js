import mongoose from 'mongoose';

/**
 * Build a MongoDB connection string from environment variables. Allows either a
 * pre-built `MONGODB_URI` or individual components for improved secret hygiene.
 */
const resolveMongoUri = () => {
  const { MONGODB_URI } = process.env;
  if (MONGODB_URI) {
    return MONGODB_URI;
  }

  const {
    MONGODB_USER,
    MONGODB_PASS,
    MONGODB_DB,
    MONGODB_HOST,
    MONGODB_OPTIONS
  } = process.env;

  const missing = [
    ['MONGODB_USER', MONGODB_USER],
    ['MONGODB_PASS', MONGODB_PASS],
    ['MONGODB_DB', MONGODB_DB],
    ['MONGODB_HOST', MONGODB_HOST]
  ].filter(([, value]) => !value);

  if (missing.length) {
    const keys = missing.map(([key]) => key).join(', ');
    throw new Error(
      `MongoDB connection variables missing. Set MONGODB_URI or supply ${keys}.`
    );
  }

  const encodedUser = encodeURIComponent(MONGODB_USER);
  const encodedPass = encodeURIComponent(MONGODB_PASS);
  const options = (MONGODB_OPTIONS ?? '').trim();
  const queryString = options ? options.replace(/^\?/, '') : 'retryWrites=true&w=majority';

  return `mongodb+srv://${encodedUser}:${encodedPass}@${MONGODB_HOST}/${MONGODB_DB}?${queryString}`;
};

const extractConnectionMeta = (uri) => {
  const match = uri.match(/^mongodb(?:\+srv)?:\/\/(?:[^@]+@)?([^/]+)\/([^?]+)/);
  if (!match) {
    return { host: 'unknown', db: 'unknown' };
  }

  return {
    host: match[1],
    db: match[2]
  };
};

/**
 * Establish a connection to MongoDB using environment configuration.
 * The function is idempotent and can be imported across the codebase.
 */
export const connectToDatabase = async () => {
  const uri = resolveMongoUri();
  const { host, db } = extractConnectionMeta(uri);
  const { APP_NAME } = process.env;

  try {
    console.log(`Connecting to MongoDB (host: ${host}, db: ${db})`);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      ...(APP_NAME ? { appName: APP_NAME } : {})
    });
    // The connection is reused by mongoose across imports, so no need to return it.
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    throw error;
  }
};

export default mongoose;
