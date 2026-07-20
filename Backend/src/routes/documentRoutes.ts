import { Router, Request, Response } from 'express';
import Doc from '../models/Document';
import Workspace from '../models/Workspace';
import mongoose from 'mongoose';

const router = Router();

// Helper to get or create a default workspace
const getOrCreateDefaultWorkspace = async () => {
  let ws = await Workspace.findOne();
  if (!ws) {
    ws = await Workspace.create({
      name: 'Ornitech Global Legal',
      memberCount: 24,
      tier: 'Enterprise 3D',
      code: 'ORN-LEG-88',
    });
  }
  return ws;
};

// GET all documents
router.get('/', async (req: Request, res: Response) => {
  try {
    const ws = await getOrCreateDefaultWorkspace();
    
    // Seed initial demo documents if the DB is completely empty
    const count = await Doc.countDocuments();
    if (count === 0) {
      await Doc.create([
        {
          name: 'MSA_Vendor_Agreement_v2.1.pdf',
          sizeBytes: 1542000,
          status: 'completed',
          summary: 'Master Services Agreement covering standard legal clauses, payment deadlines, and liability caps.',
          signees: [
            { email: 'sarah.jenkins@ornitech.ai', signed: true, signedAt: new Date(Date.now() - 14 * 60 * 1000) },
            { email: 'marcus.vance@ornitech.ai', signed: false }
          ],
          workspace: ws._id
        },
        {
          name: 'IP_Licensing_Framework_Final.pdf',
          sizeBytes: 894000,
          status: 'completed',
          summary: 'Intellectual Property licensing conditions for Ornitech Intelligence telemetry and trained base models.',
          signees: [
            { email: 'jeel.khunt@ornitech.ai', signed: true, signedAt: new Date(Date.now() - 2 * 60 * 60 * 1000) }
          ],
          workspace: ws._id
        },
        {
          name: 'Q3_Compliance_Audit_Draft.docx',
          sizeBytes: 2435000,
          status: 'scanning',
          summary: 'Automated compliance scan regarding Vector index parameters, logs and database audits.',
          signees: [],
          workspace: ws._id
        }
      ]);
    }

    const docs = await Doc.find({ workspace: ws._id }).sort({ createdAt: -1 });
    res.status(200).json(docs);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// POST a new document
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, sizeBytes } = req.body;
    if (!name || !sizeBytes) {
      return res.status(400).json({ error: 'Name and sizeBytes are required' });
    }

    const ws = await getOrCreateDefaultWorkspace();

    // Create a new document in MongoDB
    const newDoc = await Doc.create({
      name,
      sizeBytes,
      status: 'uploaded',
      signees: [],
      workspace: ws._id
    });

    res.status(201).json(newDoc);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// DELETE a document
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid document ID' });
    }

    const deletedDoc = await Doc.findByIdAndDelete(id);
    if (!deletedDoc) {
      return res.status(404).json({ error: 'Document not found' });
    }

    res.status(200).json({ message: 'Document deleted successfully', id });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;
