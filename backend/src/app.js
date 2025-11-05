import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';
import authRoutes from './modules/auth/auth.routes.js';
import eventRoutes from './modules/events/event.routes.js';
import swapRoutes from './modules/swaps/swap.routes.js';
import { errorHandler } from './middleware/errorMiddleware.js';

const app = express();

// Security and observability middlewares to keep the API production ready.
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api', swapRoutes);

app.use(errorHandler);

export default app;
