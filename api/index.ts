import express, { Express, Request, Response } from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import errorHandler from '../_middleware/error-handler';
import accountsController from '../accounts/accounts.controller';
import swaggerDocs from '../_helpers/swagger';
import { dbReady } from '../_helpers/db';

const app: Express = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());

// Allow CORS from any origin with credentials
app.use(cors({ origin: (origin, callback) => callback(null, true), credentials: true }));

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({ 
    message: 'Node.js Sign-up and Verification API',
    status: 'running',
    docs: '/api-docs'
  });
});

// Health check endpoint for Vercel
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' });
});

// Middleware to ensure database is ready before processing requests
app.use(async (req: Request, res: Response, next: any) => {
  try {
    await dbReady;
    next();
  } catch (err: any) {
    console.error('Database not ready:', err.message);
    res.status(503).json({ 
      message: 'Service temporarily unavailable',
      error: 'Database connection failed'
    });
  }
});

// API routes
app.use('/accounts', accountsController);

// Swagger docs route
app.use('/api-docs', swaggerDocs);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ message: 'Not found' });
});

// Global error handler (must be last)
app.use(errorHandler);

// Initialize database on module load (for serverless)
dbReady.catch((err) => {
  console.error('Failed to initialize database:', err);
});

export default app;

