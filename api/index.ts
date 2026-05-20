import express, { Express } from 'express';
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

// Health check endpoint for Vercel
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// API routes
app.use('/accounts', accountsController);

// Swagger docs route
app.use('/api-docs', swaggerDocs);

// Global error handler (must be last)
app.use(errorHandler);

// Export for Vercel serverless
export default app;

// Initialize database on module load (for serverless)
dbReady.catch((err) => {
  console.error('Failed to initialize database:', err);
});
