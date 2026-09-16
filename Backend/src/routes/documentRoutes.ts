import { Router, Request, Response, NextFunction } from 'express';
import Doc from '../models/Document';
import Workspace from '../models/Workspace';
import mongoose from 'mongoose';
import { SarvamService } from '../services/sarvamService';
import { upload } from '../middleware/uploadMiddleware';
import { OCRService } from '../services/ocrService';
import { DocumentService } from '../services/documentService';

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

// Sample realistic contract texts for initial seeding
const sampleCloudSlaText = `MASTER CLOUD INFRASTRUCTURE & SERVICE LEVEL AGREEMENT (SLA)
Effective Date: August 1, 2026
Expiration Date: July 31, 2028
Parties: Ornitech Systems Corp ("Client") and Apex Cloud Solutions Inc. ("Provider")
Jurisdiction: Delaware, USA
Contract Value: $480,000 USD / Year (Paid Quarterly)

SECTION 1. SERVICE LEVEL GUARANTEE & UPTIME
Provider guarantees 99.99% quarterly uptime across all cloud server nodes and database clusters. In the event of service downtime exceeding 15 consecutive minutes, Client shall automatically receive tier-based service credits equal to 5% of monthly fees for every 30 minutes of outage, capped at 30% of monthly billings.

SECTION 2. LIMITATION OF LIABILITY
Provider's total aggregate liability under this Agreement shall be capped at twelve (12) months of subscription fees paid ($480,000 USD). This limitation does not apply to gross negligence, intentional misconduct, or failure to maintain security protocols resulting in a data breach.

SECTION 3. INTELLECTUAL PROPERTY RIGHTS
Client retains exclusive ownership of all proprietary source code, custom workflows, trained AI embeddings, and customer metrics uploaded to the cloud environment. Provider receives a non-exclusive, non-transferable license solely to host and execute Client workload.

SECTION 4. UNILATERAL PRICE ESCALATION & RENEWAL
Provider reserves the right to increase annual subscription fees by up to 10% upon annual renewal. Renewal notice must be served in writing at least 60 days prior to the expiration date. Termination without cause requires 60 days prior written notice.`;

const sampleNdaText = `MUTUAL NON-DISCLOSURE AND INTELLECTUAL PROPERTY PROTECTION AGREEMENT
Effective Date: January 15, 2026
Expiration Date: January 15, 2029 (3 Years)
Parties: Ornitech Intelligence Labs and Vanguard AI Technologies
Jurisdiction: California, USA
Contract Value: Mutual NDA (Non-Monetary)

SECTION 1. DEFINITION OF CONFIDENTIAL INFORMATION
Confidential Information includes all proprietary source code, AI weight parameters, prompt architectures, customer metrics, financial roadmaps, and trade secrets disclosed by either party during the term.

SECTION 2. NON-SOLICITATION OF AI ENGINEERS
Both parties agree not to directly or indirectly solicit, recruit, or hire any key AI engineering staff or research personnel of the other party during the term of this agreement and for twelve (12) months following contract termination.

SECTION 3. OBLIGATION OF CONFIDENTIALITY
The Receiving Party shall protect Disclosing Party's Confidential Information with the same degree of care as its own proprietary data, but no less than reasonable standard of care. Standard exception applies to information legally in public domain or independently developed.`;

// GET all documents
router.get('/', async (req: Request, res: Response) => {
  try {
    const ws = await getOrCreateDefaultWorkspace();

    // Seed initial demo documents if the DB is completely empty
    const count = await Doc.countDocuments();
    if (count === 0) {
      await Doc.create([
        {
          name: 'Cloud Infrastructure & SLA Agreement.pdf',
          sizeBytes: 1542000,
          status: 'completed',
          summary: 'Cloud SLA covering 99.99% uptime, liability caps, IP retention, and price escalation clauses.',
          content: sampleCloudSlaText,
          signees: [
            { email: 'sarah.jenkins@ornitech.ai', signed: true, signedAt: new Date(Date.now() - 14 * 60 * 1000) },
            { email: 'marcus.vance@ornitech.ai', signed: false }
          ],
          workspace: ws._id
        },
        {
          name: 'Mutual NDA & IP Protection.pdf',
          sizeBytes: 894000,
          status: 'completed',
          summary: 'Mutual Non-Disclosure Agreement covering AI model weights, prompts, source code, and engineer non-solicit.',
          content: sampleNdaText,
          signees: [
            { email: 'jeel.khunt@ornitech.ai', signed: true, signedAt: new Date(Date.now() - 2 * 60 * 60 * 1000) }
          ],
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

// GET single document by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid document ID' });
    }

    const doc = await Doc.findById(id);
    if (!doc) {
      return res.status(404).json({ error: 'Document not found' });
    }

    res.status(200).json(doc);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// POST Upload a new document file with OCR text extraction
router.post('/upload', (req: Request, res: Response, next: NextFunction) => {
  upload.single('file')(req, res, async (err: any) => {
    if (err) {
      return res.status(400).json({ error: err.message || 'File upload validation error' });
    }

    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded. Please attach a PDF, DOC, DOCX, JPEG, or PNG document.' });
      }

      const ws = await getOrCreateDefaultWorkspace();
      const fileName = req.file.originalname;
      const mimeType = req.file.mimetype;
      const sizeBytes = req.file.size;

      // 1. Create document record with status 'scanning'
      const newDoc = await Doc.create({
        name: fileName,
        originalName: fileName,
        mimeType,
        sizeBytes,
        status: 'scanning',
        signees: [],
        workspace: ws._id,
      });

      // 2. Perform text extraction & OCR on buffer
      try {
        const ocrResult = await OCRService.processDocumentBuffer(req.file.buffer, mimeType, fileName);
        newDoc.content = ocrResult.text;
        newDoc.ocrContent = ocrResult.text;
        newDoc.status = 'completed';
        await newDoc.save();
      } catch (ocrErr: any) {
        console.error(`OCR processing failed for document ${newDoc._id}:`, ocrErr.message);
        newDoc.status = 'failed';
        await newDoc.save();
      }

      res.status(201).json(newDoc);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });
});

// POST a new document metadata directly
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, sizeBytes, content } = req.body;
    if (!name || !sizeBytes) {
      return res.status(400).json({ error: 'Name and sizeBytes are required' });
    }

    const ws = await getOrCreateDefaultWorkspace();

    const newDoc = await Doc.create({
      name,
      sizeBytes,
      content: content || `CONTRACT DOCUMENT: ${name}\n\nThis contract sets forth terms and conditions between the contracting parties. Standard clauses include service level guarantees, payment terms, confidentiality, liability limits, and termination parameters.`,
      status: 'uploaded',
      signees: [],
      workspace: ws._id
    });

    res.status(201).json(newDoc);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// POST /api/documents/compare - Compare two documents by ID
router.post('/compare', async (req: Request, res: Response) => {
  try {
    const { docIdA, docIdB } = req.body;

    if (!docIdA || !mongoose.Types.ObjectId.isValid(docIdA)) {
      return res.status(400).json({ error: 'Valid docIdA is required' });
    }
    if (!docIdB || !mongoose.Types.ObjectId.isValid(docIdB)) {
      return res.status(400).json({ error: 'Valid docIdB is required' });
    }
    if (docIdA === docIdB) {
      return res.status(400).json({ error: 'docIdA and docIdB must be different document IDs' });
    }

    const docA = await Doc.findById(docIdA);
    if (!docA) {
      return res.status(404).json({ error: `Document A (${docIdA}) not found` });
    }

    const docB = await Doc.findById(docIdB);
    if (!docB) {
      return res.status(404).json({ error: `Document B (${docIdB}) not found` });
    }

    const textA = docA.content || docA.ocrContent || docA.summary || `Document ${docA.name}`;
    const textB = docB.content || docB.ocrContent || docB.summary || `Document ${docB.name}`;

    const comparison = await DocumentService.compareDocuments(docA.name, textA, docB.name, textB);

    res.status(200).json({
      documentA: { id: docA._id, name: docA.name },
      documentB: { id: docB._id, name: docB.name },
      comparison,
    });
  } catch (error: any) {
    console.error('Document Comparison Error:', error);
    res.status(500).json({ error: error.message || 'Failed to compare documents' });
  }
});

// POST summarize contract using Sarvam AI
router.post('/:id/summarize', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid document ID' });
    }

    const doc = await Doc.findById(id);
    if (!doc) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const textToSummarize = doc.content || doc.ocrContent || doc.summary || `Contract ${doc.name}`;

    // Invoke Sarvam AI service
    const analysis = await SarvamService.summarizeContract(textToSummarize, doc.name);

    // Save contract analysis to Document
    doc.contractAnalysis = analysis;
    doc.status = 'completed';
    if (analysis.clauses && analysis.clauses.length > 0) {
      doc.summary = `${analysis.title} - ${analysis.clauses.length} key clauses extracted. Overall Risk Score: ${analysis.overallRisk}/100.`;
    }
    await doc.save();

    res.status(200).json(doc);
  } catch (error: any) {
    console.error('Contract Summarization Error:', error);
    res.status(500).json({
      error: error.message || 'Failed to summarize contract via Sarvam AI service.'
    });
  }
});

// POST Contract Copilot Q&A using Sarvam AI
router.post('/:id/chat', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { question, history } = req.body;

    if (!question || typeof question !== 'string' || !question.trim()) {
      return res.status(400).json({ error: 'Question string is required' });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid document ID' });
    }

    const doc = await Doc.findById(id);
    if (!doc) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const textToAnalyze = doc.content || doc.ocrContent || doc.summary || `Contract ${doc.name}`;

    // Invoke Sarvam AI Copilot
    const answer = await SarvamService.askContractCopilot(textToAnalyze, question, history || []);

    res.status(200).json({ answer });
  } catch (error: any) {
    console.error('Contract Copilot Error:', error);
    res.status(500).json({
      error: error.message || 'Failed to get answer from Sarvam AI Contract Copilot.'
    });
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
