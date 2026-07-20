import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import documentRoutes from './routes/documentRoutes';
import extractionRoutes from './routes/extractionRoutes';

const app: Application = express();

// Set up middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Register routes
app.use('/api/documents', documentRoutes);
app.use('/api/extractions', extractionRoutes);


// Health Check Route
app.get('/api/health', (req: Request, res: Response) => {

  const dbStatus = mongoose.connection.readyState;
  // 0: disconnected, 1: connected, 2: connecting, 3: disconnecting
  const dbStates = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  res.status(200).json({
    status: 'ok',
    service: 'ai-office-assistant-backend',
    database: dbStates[dbStatus as keyof typeof dbStates] || 'unknown',
  });
});

export default app;
