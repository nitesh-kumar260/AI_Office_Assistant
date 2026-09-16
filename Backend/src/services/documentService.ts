import { SarvamService } from './sarvamService';

export interface ComparisonResult {
  summary: string;
  similarityScore: number;
  keyDifferences: string[];
  addedSections: string[];
  removedSections: string[];
  modifiedClauses: string[];
}

export class DocumentService {
  /**
   * Deterministically analyzes text differences between two documents.
   */
  private static calculateTextOverlap(linesA: string[], linesB: string[]): {
    score: number;
    added: string[];
    removed: string[];
  } {
    const setA = new Set(linesA.map((l) => l.trim().toLowerCase()).filter((l) => l.length > 5));
    const setB = new Set(linesB.map((l) => l.trim().toLowerCase()).filter((l) => l.length > 5));

    if (setA.size === 0 && setB.size === 0) {
      return { score: 100, added: [], removed: [] };
    }

    const intersection = new Set([...setA].filter((x) => setB.has(x)));
    const union = new Set([...setA, ...setB]);
    const score = Math.round((intersection.size / union.size) * 100);

    const added = [...setB].filter((x) => !setA.has(x)).slice(0, 5);
    const removed = [...setA].filter((x) => !setB.has(x)).slice(0, 5);

    return { score, added, removed };
  }

  /**
   * Compares two documents using deterministic text diffing and Sarvam AI summary generation.
   */
  public static async compareDocuments(
    nameA: string,
    textA: string,
    nameB: string,
    textB: string
  ): Promise<ComparisonResult> {
    const linesA = textA.split('\n');
    const linesB = textB.split('\n');

    const diffStats = this.calculateTextOverlap(linesA, linesB);

    const systemPrompt = `You are an expert contract and document comparison AI.
Compare Document A and Document B. Analyze key legal, financial, SLA, liability, and structural differences.

Return ONLY a valid JSON object matching this schema without markdown wrap:
{
  "summary": "Concise paragraph summarizing the core differences between the two documents...",
  "keyDifferences": ["Difference 1...", "Difference 2..."],
  "modifiedClauses": ["Clause title or description that was changed..."]
}`;

    const userPrompt = `Document A Name: ${nameA}\nDocument A Content:\n${textA.slice(0, 4000)}\n\nDocument B Name: ${nameB}\nDocument B Content:\n${textB.slice(0, 4000)}`;

    let aiResult: { summary?: string; keyDifferences?: string[]; modifiedClauses?: string[] } = {};

    try {
      const rawResponse = await SarvamService.executeChatCompletion(systemPrompt, userPrompt, 0.2);
      let cleanContent = rawResponse.trim();
      const firstBrace = cleanContent.indexOf('{');
      const lastBrace = cleanContent.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        cleanContent = cleanContent.substring(firstBrace, lastBrace + 1);
      }
      aiResult = JSON.parse(cleanContent);
    } catch (err: any) {
      console.warn('AI Document Comparison summary generated with deterministic fallback:', err.message);
      aiResult = {
        summary: `Document comparison between "${nameA}" and "${nameB}". Structural similarity score: ${diffStats.score}%.`,
        keyDifferences: [
          `Similarity score calculated at ${diffStats.score}% based on text overlap.`,
          `Document A contains ${linesA.length} lines; Document B contains ${linesB.length} lines.`,
        ],
        modifiedClauses: [],
      };
    }

    return {
      summary: aiResult.summary || `Comparison complete between ${nameA} and ${nameB}. Similarity score: ${diffStats.score}%.`,
      similarityScore: diffStats.score,
      keyDifferences: Array.isArray(aiResult.keyDifferences) ? aiResult.keyDifferences : [],
      addedSections: diffStats.added,
      removedSections: diffStats.removed,
      modifiedClauses: Array.isArray(aiResult.modifiedClauses) ? aiResult.modifiedClauses : [],
    };
  }
}

export default DocumentService;
