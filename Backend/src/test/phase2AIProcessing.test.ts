import assert from 'assert';
import http from 'http';
import mongoose from 'mongoose';
import app from '../app';
import Doc from '../models/Document';
import Extraction from '../models/Extraction';
import Workspace from '../models/Workspace';
import { ExtractionService } from '../services/extractionService';
import { DocumentService } from '../services/documentService';
import { SarvamService } from '../services/sarvamService';

mongoose.set('bufferCommands', false);

async function runPhase2Tests() {
  console.log('\n--- STARTING PHASE 2: AI EXTRACTION & COMPARISON VERIFICATION ---\n');

  let passed = 0;
  let failed = 0;

  async function test(name: string, fn: () => Promise<void>) {
    try {
      await fn();
      console.log(`[PASS] ${name}`);
      passed++;
    } catch (err: any) {
      console.error(`[FAIL] ${name}:`, err.message);
      failed++;
    }
  }

  // -------------------------------------------------------------
  // Test 1: ExtractionService - Prompt config & validation
  // -------------------------------------------------------------
  await test('ExtractionService throws descriptive error for unsupported document types', async () => {
    try {
      await ExtractionService.extractDocumentData('Sample text', 'passport' as any, 'passport.pdf');
      assert.fail('Should have thrown error for unsupported type');
    } catch (err: any) {
      assert.strictEqual(err.message.includes('Unsupported extraction document type'), true);
    }
  });

  await test('ExtractionService throws descriptive error when document text is empty', async () => {
    try {
      await ExtractionService.extractDocumentData('', 'invoice', 'empty.pdf');
      assert.fail('Should have thrown error for empty document text');
    } catch (err: any) {
      assert.strictEqual(err.message.includes('Document contains no readable text content'), true);
    }
  });

  // -------------------------------------------------------------
  // Test 2: ExtractionService - AI Output Normalization with Mocked Sarvam AI
  // -------------------------------------------------------------
  await test('ExtractionService parses and normalizes AI JSON response for Invoice', async () => {
    const origChat = SarvamService.executeChatCompletion;
    SarvamService.executeChatCompletion = async () => JSON.stringify({
      invoiceNumber: 'INV-2026-999',
      vendorName: 'Acme Cloud Services',
      totalAmount: '50,000.00',
    });

    try {
      const data = await ExtractionService.extractDocumentData(
        'Invoice INV-2026-999 from Acme Cloud Services for 50000.00',
        'invoice',
        'Invoice_999.pdf'
      );
      assert.strictEqual(data.invoiceNumber, 'INV-2026-999');
      assert.strictEqual(data.vendorName, 'Acme Cloud Services');
      assert.strictEqual(data.totalAmount, '50,000.00');
      assert.strictEqual(data.paymentStatus, 'pending'); // Normalized fallback default
    } finally {
      SarvamService.executeChatCompletion = origChat;
    }
  });

  // -------------------------------------------------------------
  // Test 3: Document Comparison Engine - Deterministic Diff & AI Summary
  // -------------------------------------------------------------
  await test('DocumentService compares two documents and calculates similarity score', async () => {
    const origChat = SarvamService.executeChatCompletion;
    SarvamService.executeChatCompletion = async () => JSON.stringify({
      summary: 'Both agreements cover cloud infrastructure terms with different SLA uptime caps.',
      keyDifferences: ['Doc A guarantees 99.99% uptime, Doc B guarantees 99.9%.'],
      modifiedClauses: ['Section 1: Service Level Guarantee'],
    });

    try {
      const docAContent = 'SECTION 1. UPTIME GUARANTEE 99.99%\nSECTION 2. LIABILITY CAP $480,000\nSECTION 3. IP OWNERSHIP';
      const docBContent = 'SECTION 1. UPTIME GUARANTEE 99.9%\nSECTION 2. LIABILITY CAP $250,000\nSECTION 3. IP OWNERSHIP';

      const result = await DocumentService.compareDocuments('SLA_A.pdf', docAContent, 'SLA_B.pdf', docBContent);
      assert.strictEqual(typeof result.similarityScore, 'number');
      assert.strictEqual(result.keyDifferences.length, 1);
      assert.strictEqual(result.summary.includes('cloud infrastructure'), true);
    } finally {
      SarvamService.executeChatCompletion = origChat;
    }
  });

  // -------------------------------------------------------------
  // Test 4: HTTP API Endpoints Validation (POST /api/extractions/extract & POST /api/documents/compare)
  // -------------------------------------------------------------
  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const port = (server.address() as any).port;
  const baseUrl = `http://127.0.0.1:${port}`;

  try {
    await test('POST /api/extractions/extract returns 400 for invalid ObjectId or invalid documentType', async () => {
      const res1 = await fetch(`${baseUrl}/api/extractions/extract`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId: 'invalid-id', documentType: 'invoice' }),
      });
      assert.strictEqual(res1.status, 400);

      const fakeId = new mongoose.Types.ObjectId().toString();
      const res2 = await fetch(`${baseUrl}/api/extractions/extract`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId: fakeId, documentType: 'unsupported_type' }),
      });
      assert.strictEqual(res2.status, 400);
    });

    await test('POST /api/extractions/extract returns 404 when document is not found', async () => {
      const origFindById = Doc.findById;
      (Doc as any).findById = async () => null;

      try {
        const fakeId = new mongoose.Types.ObjectId().toString();
        const res = await fetch(`${baseUrl}/api/extractions/extract`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ documentId: fakeId, documentType: 'pan' }),
        });
        assert.strictEqual(res.status, 404);
      } finally {
        Doc.findById = origFindById;
      }
    });

    await test('POST /api/documents/compare returns 400 for identical or invalid IDs', async () => {
      const sameId = new mongoose.Types.ObjectId().toString();
      const res = await fetch(`${baseUrl}/api/documents/compare`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ docIdA: sameId, docIdB: sameId }),
      });
      assert.strictEqual(res.status, 400);
      const data: any = await res.json();
      assert.strictEqual(data.error.includes('must be different'), true);
    });

    await test('POST /api/documents/compare succeeds for valid document IDs', async () => {
      const origFindById = Doc.findById;
      const docAId = new mongoose.Types.ObjectId();
      const docBId = new mongoose.Types.ObjectId();

      (Doc as any).findById = async (id: any) => {
        if (id.toString() === docAId.toString()) {
          return { _id: docAId, name: 'DocA.pdf', content: 'Sample text A' };
        }
        if (id.toString() === docBId.toString()) {
          return { _id: docBId, name: 'DocB.pdf', content: 'Sample text B' };
        }
        return null;
      };

      const origChat = SarvamService.executeChatCompletion;
      SarvamService.executeChatCompletion = async () => JSON.stringify({
        summary: 'Comparison summary between Doc A and Doc B',
        keyDifferences: ['Text length difference'],
        modifiedClauses: [],
      });

      try {
        const res = await fetch(`${baseUrl}/api/documents/compare`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ docIdA: docAId.toString(), docIdB: docBId.toString() }),
        });
        assert.strictEqual(res.status, 200);
        const data: any = await res.json();
        assert.strictEqual(data.documentA.name, 'DocA.pdf');
        assert.strictEqual(data.documentB.name, 'DocB.pdf');
        assert.strictEqual(data.comparison.summary, 'Comparison summary between Doc A and Doc B');
      } finally {
        Doc.findById = origFindById;
        SarvamService.executeChatCompletion = origChat;
      }
    });

  } finally {
    server.close();
  }

  console.log(`\n=================================================`);
  console.log(`PHASE 2 SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log(`=================================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
  process.exit(0);
}

runPhase2Tests().catch((err) => {
  console.error('Phase 2 test suite failed:', err);
  process.exit(1);
});
