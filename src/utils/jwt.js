import jwt from 'jsonwebtoken';

const TOKEN_EXPIRY = '12h';

export const signToken = (payload) => {
  const { JWT_SECRET } = process.env;

  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is not set.');
  }

  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
};

export const verifyToken = (token) => {
  const { JWT_SECRET } = process.env;

  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is not set.');
  }

  return jwt.verify(token, JWT_SECRET);
};
