import User from '../../models/User.js';
import { signToken } from '../../utils/jwt.js';

/**
 * Persist a new user account and return the serialized session payload.
 */
export const registerUser = async ({ name, email, password }) => {
  if (!name || !email || !password) {
    const error = new Error('Name, email, and password are required.');
    error.statusCode = 400;
    throw error;
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    const error = new Error('A user with that email already exists.');
    error.statusCode = 409;
    throw error;
  }

  const user = await User.create({ name, email, password });
  return buildAuthResponse(user);
};

/**
 * Validate credentials for an existing user and return a session payload.
 */
export const authenticateUser = async ({ email, password }) => {
  if (!email || !password) {
    const error = new Error('Email and password are required.');
    error.statusCode = 400;
    throw error;
  }

  const user = await User.findOne({ email });
  if (!user) {
    const error = new Error('Invalid credentials.');
    error.statusCode = 401;
    throw error;
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    const error = new Error('Invalid credentials.');
    error.statusCode = 401;
    throw error;
  }

  return buildAuthResponse(user);
};

const buildAuthResponse = (user) => {
  const token = signToken({ id: user._id });

  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email
    }
  };
};
