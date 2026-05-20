import express, { Express, Request, Response } from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import errorHandler from '../_middleware/error-handler';
import accountsController from '../accounts/accounts.controller';
import swaggerDocs from '../_helpers/swagger';
import { getDbReady } from '../_helpers/db';

const app: Express = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors({ origin: (origin, callback) => callback(null, true), credentials: true }));

// Root — no DB needed
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    message: 'Node.js Sign-up and Verification API',
    status: 'running',
    docs: '/api-docs'
  });
});

// Health — no DB needed
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' });
});

// DB guard — only applied to routes that actually need the DB
const requireDb = async (req: Request, res: Response, next: any) => {
  try {
    await getDbReady();
    next();
  } catch (err: any) {
    console.error('Database not ready:', err.message);
    res.status(503).json({
      message: 'Service temporarily unavailable',
      error: 'Database connection failed'
    });
  }
};

// API routes — DB required
app.use('/accounts', requireDb, accountsController);

// Swagger docs — no DB needed
app.use('/api-docs', swaggerDocs);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ message: 'Not found' });
});

// Global error handler
app.use(errorHandler);

export default app;