import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import errorHandler from './_middleware/error-handler';
import accountsController from './accounts/accounts.controller';
import swaggerDocs from './_helpers/swagger';
import { dbReady } from './_helpers/db';

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());

// Allow CORS from frontend with credentials
app.use(cors({
    origin: [
        'https://jslimosnero-ipt-2026-frontend.vercel.app',
        'http://localhost:4200'  // keep this for local dev
    ],
    credentials: true
}));

// API routes
app.use('/accounts', accountsController);

// Swagger docs route
app.use('/api-docs', swaggerDocs);

// Global error handler (must be last)
app.use(errorHandler);

const port = process.env.NODE_ENV === 'production' ? (process.env.PORT || 80) : 4000;

dbReady
  .then(() => {
    app.listen(port, () => console.log('Server listening on port ' + port));
  })
  .catch((err) => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  });