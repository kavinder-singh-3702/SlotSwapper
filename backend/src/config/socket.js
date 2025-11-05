import { Server } from 'socket.io';
import { verifyToken } from '../utils/jwt.js';

let ioInstance;

const resolveOrigins = () => {
  const { CLIENT_ORIGIN } = process.env;
  if (!CLIENT_ORIGIN) {
    return '*';
  }

  return CLIENT_ORIGIN.split(',').map((origin) => origin.trim());
};

const extractToken = (socket) => {
  const authToken = socket.handshake.auth?.token;
  if (authToken) {
    return authToken;
  }

  const queryToken = socket.handshake.query?.token;
  if (queryToken) {
    return queryToken;
  }

  const header = socket.handshake.headers?.authorization;
  if (header?.startsWith('Bearer ')) {
    return header.split(' ')[1];
  }

  return null;
};

export const initSocket = (httpServer) => {
  if (ioInstance) {
    return ioInstance;
  }

  ioInstance = new Server(httpServer, {
    cors: {
      origin: resolveOrigins(),
      methods: ['GET', 'POST']
    }
  });

  ioInstance.use((socket, next) => {
    const token = extractToken(socket);

    if (!token) {
      return next(new Error('Authentication token missing.'));
    }

    try {
      const decoded = verifyToken(token);
      socket.user = { id: decoded.id };
      return next();
    } catch (error) {
      return next(new Error('Invalid authentication token.'));
    }
  });

  ioInstance.on('connection', (socket) => {
    const userRoom = socket.user.id.toString();
    socket.join(userRoom);
  });

  return ioInstance;
};

export const getIO = () => {
  if (!ioInstance) {
    throw new Error('Socket.io instance has not been initialized.');
  }

  return ioInstance;
};

export const emitToUser = (userId, event, payload) => {
  if (!ioInstance || !userId) {
    return;
  }

  ioInstance.to(userId.toString()).emit(event, payload);
};
