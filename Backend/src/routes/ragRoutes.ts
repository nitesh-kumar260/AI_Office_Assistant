import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import Doc from '../models/Document';
import Workspace from '../models/Workspace';
import { RAGService } from '../services/ragService';

const router = Router();

// POST /api/rag/search - Perform RAG vector similarity search over document chunks
router.post('/search', async (req: Request, res: Response) => {
  try {
    const { query, workspaceId, documentId, topK } = req.body;

    if (!query || typeof query !== 'string' || !query.trim()) {
      return res.status(400).json({ error: 'Search query string is required' });
    }

    const filter: any = {};

    if (documentId) {
      if (!mongoose.Types.ObjectId.isValid(documentId)) {
        return res.status(400).json({ error: 'Invalid documentId' });
      }
      filter._id = documentId;
    } else if (workspaceId) {
      if (!mongoose.Types.ObjectId.isValid(workspaceId)) {
        return res.status(400).json({ error: 'Invalid workspaceId' });
      }
      filter.workspace = workspaceId;
    } else {
      // Default to workspace filter if exists
      const ws = await Workspace.findOne();
      if (ws) {
        filter.workspace = ws._id;
      }
    }

    const docs = await Doc.find(filter);
    if (!docs || docs.length === 0) {
      return res.status(200).json({
        query: query.trim(),
        totalDocumentsSearched: 0,
        results: [],
      });
    }

    const formattedDocs = docs.map((d) => ({
      id: d._id.toString(),
      name: d.name,
      content: d.content || d.ocrContent || d.summary || '',
    }));

    const k = typeof topK === 'number' && topK > 0 ? Math.min(topK, 20) : 5;
    const results = RAGService.search(query.trim(), formattedDocs, k);

    res.status(200).json({
      query: query.trim(),
      totalDocumentsSearched: docs.length,
      topK: k,
      results,
    });
  } catch (error: any) {
    console.error('RAG Search Error:', error);
    res.status(500).json({ error: error.message || 'Failed to execute RAG search query' });
  }
});

export default router;
