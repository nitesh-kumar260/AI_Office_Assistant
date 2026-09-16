import assert from 'assert';
import http from 'http';
import mongoose from 'mongoose';
import app from '../app';
import Doc from '../models/Document';
import { SarvamService } from '../services/sarvamService';

// Disable mongoose buffering for unit testing without live DB connection
mongoose.set('bufferCommands', false);

async function runTests() {
  console.log('\n--- STARTING BACKEND CONTRACT SUMMARIZATION VERIFICATION ---\n');

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
  // Test 1: Missing API Key Handling
  // -------------------------------------------------------------
  await test('Missing SARVAM_API_KEY throws descriptive error without leaking secrets', async () => {
    const originalEnv = process.env.SARVAM_API_KEY;
    delete process.env.SARVAM_API_KEY;

    try {
      await SarvamService.summarizeContract('Sample contract text', 'Test.pdf');
      assert.fail('Should have thrown error for missing API key');
    } catch (err: any) {
      assert.strictEqual(
        err.message.includes('SARVAM_API_KEY is not configured in backend environment variables'),
        true,
        'Expected missing API key error message'
      );
      assert.strictEqual(err.message.includes('sk_'), false, 'Must not leak secret keys');
    } finally {
      process.env.SARVAM_API_KEY = originalEnv;
    }
  });

  // -------------------------------------------------------------
  // Test 2: Sarvam API Failure Handling
  // -------------------------------------------------------------
  await test('Sarvam API error response (e.g. 500) handled gracefully', async () => {
    process.env.SARVAM_API_KEY = 'test_key_placeholder';
    const originalFetch = global.fetch;

    global.fetch = async () => ({
      ok: false,
      status: 500,
      text: async () => 'Internal Sarvam AI Server Error',
    }) as any;

    try {
      await SarvamService.summarizeContract('Sample contract text', 'Test.pdf');
      assert.fail('Should have thrown API error');
    } catch (err: any) {
      assert.strictEqual(
        err.message.includes('Sarvam AI API error (500)'),
        true,
        'Expected 500 API error message'
      );
    } finally {
      global.fetch = originalFetch;
      delete process.env.SARVAM_API_KEY;
    }
  });

  // -------------------------------------------------------------
  // Test 3: Sarvam API Success & JSON Sanitization
  // -------------------------------------------------------------
  await test('Sarvam AI success response with markdown code block correctly parsed', async () => {
    process.env.SARVAM_API_KEY = 'test_key_placeholder';
    const originalFetch = global.fetch;

    const mockResponseJSON = {
      title: 'Cloud Service Agreement',
      parties: ['Company A', 'Vendor B'],
      effectiveDate: '2026-01-01',
      expirationDate: '2027-01-01',
      renewalNotice: '30 Days',
      contractValue: '$100,000 USD',
      overallRisk: 42,
      riskLevel: 'Moderate',
      jurisdiction: 'Delaware, USA',
      clauses: [
        {
          name: '1. Liability Cap',
          summary: 'Liability capped at 12 months fees',
          risk: 'Medium',
          recommendation: 'Negotiate higher cap for data breaches',
        },
      ],
    };

    global.fetch = async () => ({
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              content: `Here is your contract analysis:\n\`\`\`json\n${JSON.stringify(mockResponseJSON)}\n\`\`\``,
            },
          },
        ],
      }),
    }) as any;

    try {
      const result = await SarvamService.summarizeContract('Sample contract text', 'Test.pdf');
      assert.strictEqual(result.title, 'Cloud Service Agreement');
      assert.strictEqual(result.overallRisk, 42);
      assert.strictEqual(result.clauses.length, 1);
      assert.strictEqual(result.clauses[0].name, '1. Liability Cap');
    } finally {
      global.fetch = originalFetch;
      delete process.env.SARVAM_API_KEY;
    }
  });

  // -------------------------------------------------------------
  // Test 4: Contract Copilot Q&A
  // -------------------------------------------------------------
  await test('SarvamService askContractCopilot formats history and returns response', async () => {
    process.env.SARVAM_API_KEY = 'test_key_placeholder';
    const originalFetch = global.fetch;

    global.fetch = async (_url: any, options: any) => {
      const body = JSON.parse(options.body);
      assert.strictEqual(body.messages.length, 3); // system, 1 history item, user question
      return {
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                content: 'The limitation of liability is capped at $480,000 USD.',
              },
            },
          ],
        }),
      } as any;
    };

    try {
      const answer = await SarvamService.askContractCopilot(
        'Contract text with liability cap of $480k',
        'What is the liability cap?',
        [{ sender: 'user', text: 'Hello' }]
      );
      assert.strictEqual(answer.includes('$480,000 USD'), true);
    } finally {
      global.fetch = originalFetch;
      delete process.env.SARVAM_API_KEY;
    }
  });

  // -------------------------------------------------------------
  // Test 5: HTTP Endpoint Validation & Errors (Invalid ID, Bad Request)
  // -------------------------------------------------------------
  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const port = (server.address() as any).port;
  const baseUrl = `http://127.0.0.1:${port}`;

  try {
    await test('POST /api/documents/:id/summarize returns 400 for invalid ObjectId', async () => {
      const res = await fetch(`${baseUrl}/api/documents/invalid-id-123/summarize`, { method: 'POST' });
      assert.strictEqual(res.status, 400);
      const data: any = await res.json();
      assert.strictEqual(data.error, 'Invalid document ID');
    });

    await test('POST /api/documents/:id/chat returns 400 for missing question', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const res = await fetch(`${baseUrl}/api/documents/${fakeId}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      assert.strictEqual(res.status, 400);
      const data: any = await res.json();
      assert.strictEqual(data.error, 'Question string is required');
    });

    await test('POST /api/documents/:id/chat returns 400 for invalid ObjectId', async () => {
      const res = await fetch(`${baseUrl}/api/documents/not-a-valid-id/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: 'What is the penalty?' }),
      });
      assert.strictEqual(res.status, 400);
      const data: any = await res.json();
      assert.strictEqual(data.error, 'Invalid document ID');
    });

    await test('POST /api/documents/:id/summarize handles doc not found or DB error gracefully', async () => {
      // Mock Doc.findById to return null (doc not found)
      const origFindById = Doc.findById;
      (Doc as any).findById = async () => null;

      try {
        const fakeId = new mongoose.Types.ObjectId().toString();
        const res = await fetch(`${baseUrl}/api/documents/${fakeId}/summarize`, { method: 'POST' });
        assert.strictEqual(res.status, 404);
        const data: any = await res.json();
        assert.strictEqual(data.error, 'Document not found');
      } finally {
        Doc.findById = origFindById;
      }
    });

    await test('POST /api/documents/:id/chat handles doc not found gracefully', async () => {
      const origFindById = Doc.findById;
      (Doc as any).findById = async () => null;

      try {
        const fakeId = new mongoose.Types.ObjectId().toString();
        const res = await fetch(`${baseUrl}/api/documents/${fakeId}/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question: 'What is the SLA percentage?' }),
        });
        assert.strictEqual(res.status, 404);
        const data: any = await res.json();
        assert.strictEqual(data.error, 'Document not found');
      } finally {
        Doc.findById = origFindById;
      }
    });

    await test('POST /api/documents/:id/summarize updates doc contractAnalysis and saves to DB', async () => {
      process.env.SARVAM_API_KEY = 'test_key_placeholder';
      const originalFetch = global.fetch;

      global.fetch = async (url: any, options: any) => {
        if (typeof url === 'string' && url.includes('127.0.0.1')) {
          return originalFetch(url, options);
        }
        return {
          ok: true,
          json: async () => ({
            choices: [
              {
                message: {
                  content: JSON.stringify({
                    title: 'Cloud Infrastructure SLA',
                    parties: ['Ornitech', 'Apex Cloud'],
                    effectiveDate: '2026-08-01',
                    expirationDate: '2028-07-31',
                    renewalNotice: '60 Days',
                    contractValue: '$480,000 USD',
                    overallRisk: 65,
                    riskLevel: 'Moderate',
                    jurisdiction: 'Delaware',
                    clauses: [
                      {
                        name: '1. Uptime SLA',
                        summary: '99.99% quarterly uptime guarantee.',
                        risk: 'Low',
                        recommendation: 'Monitor credits.',
                      },
                    ],
                  }),
                },
              },
            ],
          }),
        } as any;
      };

      let savedDoc: any = null;
      const mockDoc: any = {
        _id: new mongoose.Types.ObjectId(),
        name: 'Cloud Infrastructure SLA.pdf',
        content: 'Sample SLA content text',
        status: 'uploaded',
        save: async function () {
          savedDoc = this;
          return this;
        },
      };

      const origFindById = Doc.findById;
      (Doc as any).findById = async () => mockDoc;

      try {
        const res = await fetch(`${baseUrl}/api/documents/${mockDoc._id}/summarize`, { method: 'POST' });
        assert.strictEqual(res.status, 200);
        assert.notStrictEqual(savedDoc, null);
        assert.strictEqual(savedDoc.status, 'completed');
        assert.strictEqual(savedDoc.contractAnalysis.title, 'Cloud Infrastructure SLA');
        assert.strictEqual(savedDoc.contractAnalysis.overallRisk, 65);
        assert.strictEqual(savedDoc.contractAnalysis.clauses.length, 1);
      } finally {
        Doc.findById = origFindById;
        global.fetch = originalFetch;
        delete process.env.SARVAM_API_KEY;
      }
    });

  } finally {
    server.close();
  }

  // -------------------------------------------------------------
  // Test 7: Document Model Persistence & Dynamic Content Verification
  // -------------------------------------------------------------
  await test('Document model structure supports dynamic contractAnalysis and content', async () => {
    const dummyDoc = new Doc({
      name: 'Custom Dynamic Vendor SLA.pdf',
      sizeBytes: 500000,
      content: 'Dynamic custom contract content supplied by backend upload/API',
      status: 'uploaded',
      workspace: new mongoose.Types.ObjectId(),
      signees: [],
    });

    dummyDoc.contractAnalysis = {
      title: 'Custom Dynamic Vendor SLA',
      parties: ['Ornitech', 'Dynamic Cloud Corp'],
      effectiveDate: '2026-09-01',
      expirationDate: '2027-09-01',
      renewalNotice: '60 Days',
      contractValue: '$120,000 USD',
      overallRisk: 30,
      riskLevel: 'Low',
      jurisdiction: 'California',
      clauses: [
        {
          name: '1. Uptime Guarantee',
          summary: '99.9% availability guaranteed',
          risk: 'Low',
          recommendation: 'Standard SLA terms',
        },
      ],
    };

    assert.strictEqual(dummyDoc.content, 'Dynamic custom contract content supplied by backend upload/API');
    assert.strictEqual(dummyDoc.contractAnalysis.clauses.length, 1);
    assert.strictEqual(dummyDoc.contractAnalysis.overallRisk, 30);
  });

  console.log(`\n=================================================`);
  console.log(`SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log(`=================================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
  process.exit(0);
}

runTests().catch((err) => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
