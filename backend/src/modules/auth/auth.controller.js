import { authenticateUser, registerUser } from './auth.service.js';

/**
 * Register a new user and return a JWT for immediate authenticated use.
 */
export const register = async (req, res, next) => {
  try {
    const payload = await registerUser(req.body);
    res.status(201).json(payload);
  } catch (error) {
    handleServiceError(error, res, next);
  }
};

/**
 * Authenticate an existing user by email/password and return a signed JWT.
 */
export const login = async (req, res, next) => {
  try {
    const payload = await authenticateUser(req.body);
    res.json(payload);
  } catch (error) {
    handleServiceError(error, res, next);
  }
};

const handleServiceError = (error, res, next) => {
  if (error?.statusCode) {
    return res.status(error.statusCode).json({ message: error.message });
  }
  return next(error);
};
