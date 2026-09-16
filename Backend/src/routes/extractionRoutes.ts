import { Router, Request, Response } from 'express';
import Extraction from '../models/Extraction';
import Doc from '../models/Document';
import Workspace from '../models/Workspace';
import mongoose from 'mongoose';
import { ExtractionService } from '../services/extractionService';

const router = Router();

// Helper to get default workspace
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

// GET all extraction history records
router.get('/', async (req: Request, res: Response) => {
  try {
    const ws = await getOrCreateDefaultWorkspace();

    // Seed mock extraction history if empty
    const count = await Extraction.countDocuments();
    if (count === 0) {
      await Extraction.create([
        {
          documentType: 'invoice',
          fileName: 'INV_2026_0891.pdf',
          extractedData: {
            invoiceNumber: 'INV-2026-0891',
            vendorName: 'AWS Cloud Services India',
            gstin: '27AADCA1234F1Z8',
            billingDate: '2026-07-15',
            dueDate: '2026-08-15',
            taxableAmount: '1,45,200.00',
            cgst: '13,068.00',
            sgst: '13,068.00',
            totalAmount: '1,71,336.00',
            paymentStatus: 'pending'
          },
          workspace: ws._id
        },
        {
          documentType: 'pan',
          fileName: 'jeel_khunt_pan_scan.jpg',
          extractedData: {
            panNumber: 'BHPQK1294F',
            fullName: 'JEEL KHUNT',
            fatherName: 'MANSUKHBHAI KHUNT',
            dateOfBirth: '2001-05-14',
            signaturePresent: 'true'
          },
          workspace: ws._id
        },
        {
          documentType: 'aadhaar',
          fileName: 'aadhaar_front_back_crop.png',
          extractedData: {
            aadhaarNumber: '8812 4310 9942',
            fullName: 'Jeel Mansukhbhai Khunt',
            gender: 'Male',
            dateOfBirth: '2001-05-14',
            address: 'Ornitech Labs, G-12, Sector V, Salt Lake, Kolkata, West Bengal - 700091'
          },
          workspace: ws._id
        },
        {
          documentType: 'gst',
          fileName: 'gstin_registration_cert.pdf',
          extractedData: {
            gstin: '19AAFCO9914M1Z2',
            legalName: 'ORNITECH INTELLIGENCE LABS PRIVATE LIMITED',
            tradeName: 'Ornitech Intelligence Labs',
            constitutionOfBusiness: 'Private Limited Company',
            dateOfLiability: '2025-10-12',
            registrationType: 'Regular'
          },
          workspace: ws._id
        }
      ]);
    }

    const extractions = await Extraction.find({ workspace: ws._id }).sort({ createdAt: -1 });
    res.status(200).json(extractions);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// POST a new extraction log record
router.post('/', async (req: Request, res: Response) => {
  try {
    const { documentType, fileName, extractedData } = req.body;
    if (!documentType || !fileName || !extractedData) {
      return res.status(400).json({ error: 'documentType, fileName and extractedData are required' });
    }

    const ws = await getOrCreateDefaultWorkspace();

    const newExtraction = await Extraction.create({
      documentType,
      fileName,
      extractedData,
      workspace: ws._id
    });

    res.status(201).json(newExtraction);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// POST /api/extractions/extract - Run AI extraction on a document and persist results
router.post('/extract', async (req: Request, res: Response) => {
  try {
    const { documentId, documentType } = req.body;

    if (!documentId || !mongoose.Types.ObjectId.isValid(documentId)) {
      return res.status(400).json({ error: 'Valid documentId is required' });
    }

    const validTypes = ['invoice', 'pan', 'aadhaar', 'gst'];
    if (!documentType || !validTypes.includes(documentType)) {
      return res.status(400).json({ error: `documentType must be one of: ${validTypes.join(', ')}` });
    }

    const doc = await Doc.findById(documentId);
    if (!doc) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const textToExtract = doc.content || doc.ocrContent;
    if (!textToExtract || !textToExtract.trim()) {
      return res.status(400).json({ error: 'Document contains no text content for extraction' });
    }

    const extractedData = await ExtractionService.extractDocumentData(textToExtract, documentType, doc.name);

    const ws = doc.workspace || (await getOrCreateDefaultWorkspace())._id;

    const newExtraction = await Extraction.create({
      documentType,
      fileName: doc.name,
      extractedData,
      workspace: ws,
    });

    res.status(201).json(newExtraction);
  } catch (error: any) {
    console.error('AI Extraction Error:', error);
    res.status(500).json({ error: error.message || 'Failed to extract document information' });
  }
});

// DELETE an extraction log record
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid record ID' });
    }

    const deletedRecord = await Extraction.findByIdAndDelete(id);
    if (!deletedRecord) {
      return res.status(404).json({ error: 'Extraction record not found' });
    }

    res.status(200).json({ message: 'Record deleted successfully', id });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;
