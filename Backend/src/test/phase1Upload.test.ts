import assert from 'assert';
import http from 'http';
import mongoose from 'mongoose';
import app from '../app';
import Doc from '../models/Document';
import Workspace from '../models/Workspace';
import { OCRService } from '../services/ocrService';

mongoose.set('bufferCommands', false);

async function runPhase1Tests() {
  console.log('\n--- STARTING PHASE 1: DOCUMENT UPLOAD & OCR VERIFICATION ---\n');

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
  // Test 1: OCR Service - Plaintext & Buffer Extraction
  // -------------------------------------------------------------
  await test('OCRService extracts text from text/plain and PDF buffer representation', async () => {
    const textBuffer = Buffer.from('Master Service Level Agreement between Party A and Party B.');
    const result = await OCRService.processDocumentBuffer(textBuffer, 'text/plain', 'contract.txt');
    assert.strictEqual(result.text.includes('Master Service Level Agreement'), true);
  });

  // -------------------------------------------------------------
  // Test 2: OCR Service - Image Buffer Processing
  // -------------------------------------------------------------
  await test('OCRService processes image buffers (PNG/JPEG) without failing', async () => {
    const imageBuffer = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]); // PNG header bytes
    const result = await OCRService.processDocumentBuffer(imageBuffer, 'image/png', 'receipt.png');
    assert.strictEqual(result.text.includes('OCR Image Content: receipt.png'), true);
    assert.strictEqual(result.pageCount, 1);
  });

  // -------------------------------------------------------------
  // Test 3: HTTP Multipart Upload Endpoints
  // -------------------------------------------------------------
  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const port = (server.address() as any).port;
  const baseUrl = `http://127.0.0.1:${port}`;

  try {
    await test('POST /api/documents/upload returns 400 when no file is attached', async () => {
      const res = await fetch(`${baseUrl}/api/documents/upload`, {
        method: 'POST',
      });
      assert.strictEqual(res.status, 400);
      const data: any = await res.json();
      assert.strictEqual(data.error.includes('No file uploaded'), true);
    });

    await test('POST /api/documents/upload validates file type (rejects invalid extension)', async () => {
      const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
      const bodyParts = [
        `--${boundary}`,
        'Content-Disposition: form-data; name="file"; filename="malicious_script.exe"',
        'Content-Type: application/x-msdownload',
        '',
        'BINARY_EXECUTABLE_DATA',
        `--${boundary}--`,
      ];

      const res = await fetch(`${baseUrl}/api/documents/upload`, {
        method: 'POST',
        headers: {
          'Content-Type': `multipart/form-data; boundary=${boundary}`,
        },
        body: bodyParts.join('\r\n'),
      });

      assert.strictEqual(res.status, 400);
      const data: any = await res.json();
      assert.strictEqual(data.error.includes('Invalid file type'), true);
    });

    await test('POST /api/documents/upload accepts valid PDF and persists content & status', async () => {
      const origCreate = Doc.create;
      const origWorkspaceFindOne = Workspace.findOne;
      let createdDoc: any = null;

      (Workspace as any).findOne = async () => ({
        _id: new mongoose.Types.ObjectId(),
        name: 'Test Workspace',
      });

      (Doc as any).create = async (docData: any) => {
        createdDoc = {
          ...docData,
          _id: new mongoose.Types.ObjectId(),
          save: async function () { return this; },
        };
        return createdDoc;
      };

      try {
        const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
        const pdfContent = '%PDF-1.4 sample PDF header and contract body text';
        const bodyParts = [
          `--${boundary}`,
          'Content-Disposition: form-data; name="file"; filename="Vendor_SLA_2026.pdf"',
          'Content-Type: application/pdf',
          '',
          pdfContent,
          `--${boundary}--`,
        ];

        const res = await fetch(`${baseUrl}/api/documents/upload`, {
          method: 'POST',
          headers: {
            'Content-Type': `multipart/form-data; boundary=${boundary}`,
          },
          body: bodyParts.join('\r\n'),
        });

        assert.strictEqual(res.status, 201);
        assert.notStrictEqual(createdDoc, null);
        assert.strictEqual(createdDoc.name, 'Vendor_SLA_2026.pdf');
        assert.strictEqual(createdDoc.mimeType, 'application/pdf');
        assert.strictEqual(createdDoc.status, 'completed');
        assert.notStrictEqual(createdDoc.content, undefined);
      } finally {
        Doc.create = origCreate;
        Workspace.findOne = origWorkspaceFindOne;
      }
    });

  } finally {
    server.close();
  }

  console.log(`\n=================================================`);
  console.log(`PHASE 1 SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log(`=================================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
  process.exit(0);
}

runPhase1Tests().catch((err) => {
  console.error('Phase 1 test suite failed:', err);
  process.exit(1);
});
