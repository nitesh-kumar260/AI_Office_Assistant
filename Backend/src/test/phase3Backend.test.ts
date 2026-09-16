import assert from 'assert';
import http from 'http';
import mongoose from 'mongoose';
import app from '../app';
import Doc from '../models/Document';
import Extraction from '../models/Extraction';
import Workspace from '../models/Workspace';
import User from '../models/User';
import { RAGService } from '../services/ragService';
import { ReportService } from '../services/reportService';

mongoose.set('bufferCommands', false);

async function runPhase3Tests() {
  console.log('\n--- STARTING PHASE 3: RAG, REPORTS, SIGNATURES & WORKSPACE VERIFICATION ---\n');

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
  // Test 1: RAG Service Chunking & Vector Search
  // -------------------------------------------------------------
  await test('RAGService chunkText splits text into overlapping chunks', async () => {
    const sampleText = 'Paragraph 1: Cloud SLA Uptime guarantee is 99.99%. '.repeat(20);
    const chunks = RAGService.chunkText(sampleText, 200, 50);
    assert.strictEqual(chunks.length > 1, true);
    assert.strictEqual(chunks[0].includes('Cloud SLA Uptime'), true);
  });

  await test('RAGService search ranks relevant document chunks by TF-IDF vector similarity', async () => {
    const docs = [
      {
        id: 'doc1',
        name: 'Cloud SLA.pdf',
        content: 'SECTION 1. SERVICE LEVEL GUARANTEE & UPTIME 99.99%. Provider guarantees 99.99% quarterly uptime across all cloud server nodes and database clusters.',
      },
      {
        id: 'doc2',
        name: 'NDA Agreement.pdf',
        content: 'SECTION 1. CONFIDENTIAL INFORMATION. Confidential Information includes all proprietary source code, AI weight parameters, and trade secrets.',
      },
    ];

    const results = RAGService.search('uptime guarantee SLA', docs, 5);
    assert.strictEqual(results.length > 0, true);
    assert.strictEqual(results[0].documentName, 'Cloud SLA.pdf');
    assert.strictEqual(results[0].score > 0, true);
  });

  // -------------------------------------------------------------
  // Test 2: Report Aggregation Service
  // -------------------------------------------------------------
  await test('ReportService aggregates metrics from Mongoose model data', async () => {
    const origDocCount = Doc.countDocuments;
    const origDocFind = Doc.find;
    const origExtCount = Extraction.countDocuments;
    const origExtFind = Extraction.find;
    const origWsCount = Workspace.countDocuments;
    const origUserCount = User.countDocuments;

    (Doc as any).countDocuments = async () => 2;
    (Doc as any).find = async () => [
      {
        status: 'completed',
        contractAnalysis: { overallRisk: 30 },
        signees: [{ email: 'admin@ornitech.ai', signed: true }],
      },
      {
        status: 'completed',
        contractAnalysis: { overallRisk: 80 },
        signees: [{ email: 'legal@ornitech.ai', signed: false }],
      },
    ];

    (Extraction as any).countDocuments = async () => 1;
    (Extraction as any).find = async () => [
      { documentType: 'invoice', fileName: 'INV_1.pdf' },
    ];
    (Workspace as any).countDocuments = async () => 1;
    (User as any).countDocuments = async () => 2;

    try {
      const report = await ReportService.generateReport();
      assert.strictEqual(report.summary.totalDocuments, 2);
      assert.strictEqual(report.summary.totalExtractions, 1);
      assert.strictEqual(report.summary.totalWorkspaces, 1);
      assert.strictEqual(report.summary.totalUsers, 2);
      assert.strictEqual(report.documentMetrics.byStatus.completed, 2);
      assert.strictEqual(report.documentMetrics.riskDistribution.low, 1);
      assert.strictEqual(report.documentMetrics.riskDistribution.high, 1);
      assert.strictEqual(report.extractionMetrics.byType.invoice, 1);
      assert.strictEqual(report.signatureMetrics.totalSigneesRequested, 2);
      assert.strictEqual(report.signatureMetrics.totalSigned, 1);
      assert.strictEqual(report.signatureMetrics.completionRatePercentage, 50);
    } finally {
      Doc.countDocuments = origDocCount;
      Doc.find = origDocFind;
      Extraction.countDocuments = origExtCount;
      Extraction.find = origExtFind;
      Workspace.countDocuments = origWsCount;
      User.countDocuments = origUserCount;
    }
  });

  // -------------------------------------------------------------
  // Test 3: HTTP API Endpoints (RAG, Reports, Signatures, Workspaces)
  // -------------------------------------------------------------
  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const port = (server.address() as any).port;
  const baseUrl = `http://127.0.0.1:${port}`;

  try {
    // 3.1 RAG Search API
    await test('POST /api/rag/search returns 400 for empty query', async () => {
      const res = await fetch(`${baseUrl}/api/rag/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: '' }),
      });
      assert.strictEqual(res.status, 400);
    });

    await test('POST /api/rag/search returns top relevant chunks for search query', async () => {
      const origDocFind = Doc.find;
      const origWsFindOne = Workspace.findOne;

      (Workspace as any).findOne = async () => ({ _id: new mongoose.Types.ObjectId() });
      (Doc as any).find = async () => [
        {
          _id: new mongoose.Types.ObjectId(),
          name: 'Master Cloud SLA.pdf',
          content: 'Provider guarantees 99.99% quarterly uptime across all cloud server nodes and database clusters.',
        },
      ];

      try {
        const res = await fetch(`${baseUrl}/api/rag/search`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: 'uptime guarantee' }),
        });

        assert.strictEqual(res.status, 200);
        const data: any = await res.json();
        assert.strictEqual(data.totalDocumentsSearched, 1);
        assert.strictEqual(data.results.length, 1);
        assert.strictEqual(data.results[0].documentName, 'Master Cloud SLA.pdf');
      } finally {
        Doc.find = origDocFind;
        Workspace.findOne = origWsFindOne;
      }
    });

    // 3.2 Digital Signatures API
    await test('Digital Signatures API - request, audit, sign, and prevent duplicate sign', async () => {
      const origFindById = Doc.findById;
      const docId = new mongoose.Types.ObjectId();
      const mockDoc: any = {
        _id: docId,
        name: 'SLA.pdf',
        signees: [],
        save: async function () { return this; },
      };

      (Doc as any).findById = async () => mockDoc;

      try {
        // Request signature
        const reqRes = await fetch(`${baseUrl}/api/signatures/request`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ documentId: docId.toString(), email: 'signer@ornitech.ai' }),
        });
        assert.strictEqual(reqRes.status, 201);
        assert.strictEqual(mockDoc.signees.length, 1);
        assert.strictEqual(mockDoc.signees[0].signed, false);

        // Fetch signature status
        const auditRes = await fetch(`${baseUrl}/api/signatures/document/${docId}`);
        assert.strictEqual(auditRes.status, 200);
        const auditData: any = await auditRes.json();
        assert.strictEqual(auditData.signatureState, 'pending');

        // Approve & Sign
        const signRes = await fetch(`${baseUrl}/api/signatures/sign`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ documentId: docId.toString(), email: 'signer@ornitech.ai' }),
        });
        assert.strictEqual(signRes.status, 200);
        assert.strictEqual(mockDoc.signees[0].signed, true);

        // Prevent duplicate re-signing
        const dupRes = await fetch(`${baseUrl}/api/signatures/sign`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ documentId: docId.toString(), email: 'signer@ornitech.ai' }),
        });
        assert.strictEqual(dupRes.status, 400);
      } finally {
        Doc.findById = origFindById;
      }
    });

    // 3.3 Workspace & Role Validation API
    await test('POST /api/workspaces/:id/members validates role assignment', async () => {
      const origWsFindById = Workspace.findById;
      const wsId = new mongoose.Types.ObjectId();
      (Workspace as any).findById = async () => ({ _id: wsId, name: 'Legal Ops' });

      try {
        const res = await fetch(`${baseUrl}/api/workspaces/${wsId}/members`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'john@ornitech.ai', role: 'invalid_role_name' }),
        });
        assert.strictEqual(res.status, 400);
        const data: any = await res.json();
        assert.strictEqual(data.error.includes('Invalid role'), true);
      } finally {
        Workspace.findById = origWsFindById;
      }
    });

    await test('PUT /api/workspaces/:id/members/:userId prevents demoting sole admin', async () => {
      const origUserFindById = User.findById;
      const origUserCount = User.countDocuments;
      const wsId = new mongoose.Types.ObjectId();
      const userId = new mongoose.Types.ObjectId();

      (User as any).findById = async () => ({ _id: userId, role: 'admin' });
      (User as any).countDocuments = async () => 1; // Sole admin

      try {
        const res = await fetch(`${baseUrl}/api/workspaces/${wsId}/members/${userId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role: 'legal' }),
        });
        assert.strictEqual(res.status, 400);
        const data: any = await res.json();
        assert.strictEqual(data.error.includes('Cannot demote the last remaining admin'), true);
      } finally {
        User.findById = origUserFindById;
        User.countDocuments = origUserCount;
      }
    });

  } finally {
    server.close();
  }

  console.log(`\n=================================================`);
  console.log(`PHASE 3 SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log(`=================================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
  process.exit(0);
}

runPhase3Tests().catch((err) => {
  console.error('Phase 3 test suite failed:', err);
  process.exit(1);
});
