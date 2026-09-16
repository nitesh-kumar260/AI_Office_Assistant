import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import { ReportService } from '../services/reportService';

const router = Router();

// GET /api/reports/summary - Generate aggregate metrics report
router.get('/summary', async (req: Request, res: Response) => {
  try {
    const { workspaceId } = req.query;

    if (workspaceId && typeof workspaceId === 'string' && !mongoose.Types.ObjectId.isValid(workspaceId)) {
      return res.status(400).json({ error: 'Invalid workspaceId parameter' });
    }

    const report = await ReportService.generateReport(workspaceId as string | undefined);
    res.status(200).json(report);
  } catch (error: any) {
    console.error('Report Generation Error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate system report' });
  }
});

// GET /api/reports/export - Export structured JSON report payload
router.get('/export', async (req: Request, res: Response) => {
  try {
    const { workspaceId } = req.query;
    if (workspaceId && typeof workspaceId === 'string' && !mongoose.Types.ObjectId.isValid(workspaceId)) {
      return res.status(400).json({ error: 'Invalid workspaceId parameter' });
    }

    const report = await ReportService.generateReport(workspaceId as string | undefined);

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=AI_Office_Assistant_Report_${Date.now()}.json`);
    res.status(200).json(report);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to export system report' });
  }
});

export default router;
