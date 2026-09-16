import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import Doc from '../models/Document';

const router = Router();

const LEGAL_DISCLAIMER = 'Internal workspace workflow signature tracker. This system provides document approval state tracking and does not constitute a cryptographically certified or legally binding digital signature under PKI frameworks.';

// Helper to validate email format
const isValidEmail = (email: string): boolean => {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
};

// POST /api/signatures/request - Add a new signee signature request to a document
router.post('/request', async (req: Request, res: Response) => {
  try {
    const { documentId, email } = req.body;

    if (!documentId || !mongoose.Types.ObjectId.isValid(documentId)) {
      return res.status(400).json({ error: 'Valid documentId is required' });
    }

    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ error: 'Valid email address is required' });
    }

    const doc = await Doc.findById(documentId);
    if (!doc) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const existingSignee = doc.signees.find((s) => s.email === cleanEmail);
    if (existingSignee) {
      return res.status(400).json({ error: `Signature request already exists for ${cleanEmail}` });
    }

    doc.signees.push({
      email: cleanEmail,
      signed: false,
    });

    await doc.save();

    res.status(201).json({
      message: 'Signature request created successfully',
      documentId: doc._id,
      signees: doc.signees,
      disclaimer: LEGAL_DISCLAIMER,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to create signature request' });
  }
});

// GET /api/signatures/document/:documentId - Fetch signature audit status for a document
router.get('/document/:documentId', async (req: Request, res: Response) => {
  try {
    const { documentId } = req.params;

    if (!documentId || !mongoose.Types.ObjectId.isValid(documentId)) {
      return res.status(400).json({ error: 'Invalid documentId' });
    }

    const doc = await Doc.findById(documentId);
    if (!doc) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const totalSignees = doc.signees.length;
    const signedCount = doc.signees.filter((s) => s.signed).length;
    let signatureState = 'no_signees';
    if (totalSignees > 0) {
      if (signedCount === 0) signatureState = 'pending';
      else if (signedCount < totalSignees) signatureState = 'partially_signed';
      else signatureState = 'completed';
    }

    res.status(200).json({
      documentId: doc._id,
      documentName: doc.name,
      signatureState,
      totalSignees,
      signedCount,
      signees: doc.signees,
      disclaimer: LEGAL_DISCLAIMER,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch signature status' });
  }
});

// POST /api/signatures/sign - Approve and record signee signature
router.post('/sign', async (req: Request, res: Response) => {
  try {
    const { documentId, email } = req.body;

    if (!documentId || !mongoose.Types.ObjectId.isValid(documentId)) {
      return res.status(400).json({ error: 'Valid documentId is required' });
    }

    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ error: 'Valid email address is required' });
    }

    const doc = await Doc.findById(documentId);
    if (!doc) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const signee = doc.signees.find((s) => s.email === cleanEmail);
    if (!signee) {
      return res.status(404).json({ error: `No signature request found for email ${cleanEmail}` });
    }

    if (signee.signed) {
      return res.status(400).json({ error: `Document has already been signed by ${cleanEmail}` });
    }

    signee.signed = true;
    signee.signedAt = new Date();

    await doc.save();

    res.status(200).json({
      message: 'Document signed successfully',
      documentId: doc._id,
      signee,
      disclaimer: LEGAL_DISCLAIMER,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to process signature' });
  }
});

// POST /api/signatures/reject - Reject signature request
router.post('/reject', async (req: Request, res: Response) => {
  try {
    const { documentId, email, reason } = req.body;

    if (!documentId || !mongoose.Types.ObjectId.isValid(documentId)) {
      return res.status(400).json({ error: 'Valid documentId is required' });
    }

    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ error: 'Valid email address is required' });
    }

    const doc = await Doc.findById(documentId);
    if (!doc) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const index = doc.signees.findIndex((s) => s.email === cleanEmail);
    if (index === -1) {
      return res.status(404).json({ error: `No signature request found for email ${cleanEmail}` });
    }

    if (doc.signees[index].signed) {
      return res.status(400).json({ error: `Cannot reject an already completed signature by ${cleanEmail}` });
    }

    doc.signees.splice(index, 1);
    await doc.save();

    res.status(200).json({
      message: 'Signature request rejected and removed',
      documentId: doc._id,
      rejectedEmail: cleanEmail,
      reason: reason || 'User rejected signature request',
      disclaimer: LEGAL_DISCLAIMER,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to reject signature request' });
  }
});

export default router;
