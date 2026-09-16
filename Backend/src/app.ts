import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import documentRoutes from './routes/documentRoutes';
import extractionRoutes from './routes/extractionRoutes';
import ragRoutes from './routes/ragRoutes';
import reportRoutes from './routes/reportRoutes';
import signatureRoutes from './routes/signatureRoutes';
import workspaceRoutes from './routes/workspaceRoutes';

const app: Application = express();

// Set up middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Register routes
app.use('/api/documents', documentRoutes);
app.use('/api/extractions', extractionRoutes);
app.use('/api/rag', ragRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/signatures', signatureRoutes);
app.use('/api/workspaces', workspaceRoutes);


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
