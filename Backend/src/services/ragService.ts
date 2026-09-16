export interface RAGChunkResult {
  documentId: string;
  documentName: string;
  chunkIndex: number;
  text: string;
  score: number;
}

export class RAGService {
  private static STOP_WORDS = new Set([
    'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'has', 'he',
    'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the', 'to', 'was', 'were', 'will', 'with',
  ]);

  /**
   * Splits text into deterministic overlapping chunks.
   */
  public static chunkText(text: string, chunkSize = 500, overlap = 100): string[] {
    if (!text || text.trim().length === 0) {
      return [];
    }

    const cleanText = text.replace(/\r\n/g, '\n').trim();
    if (cleanText.length <= chunkSize) {
      return [cleanText];
    }

    const chunks: string[] = [];
    let start = 0;

    while (start < cleanText.length) {
      let end = start + chunkSize;
      if (end < cleanText.length) {
        // Try to break at newline or space boundary
        const lastSpace = cleanText.lastIndexOf(' ', end);
        if (lastSpace > start + chunkSize / 2) {
          end = lastSpace;
        }
      } else {
        end = cleanText.length;
      }

      const chunk = cleanText.substring(start, end).trim();
      if (chunk.length > 0) {
        chunks.push(chunk);
      }

      start = end - overlap;
      if (start >= cleanText.length || end === cleanText.length) {
        break;
      }
    }

    return chunks;
  }

  /**
   * Tokenizes text into normalized word tokens.
   */
  private static tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 2 && !this.STOP_WORDS.has(w));
  }

  /**
   * Constructs TF-IDF term frequency vector map for a given text.
   */
  public static buildTermVector(text: string): Map<string, number> {
    const tokens = this.tokenize(text);
    const termFreq = new Map<string, number>();

    for (const token of tokens) {
      termFreq.set(token, (termFreq.get(token) || 0) + 1);
    }

    // Normalize frequencies
    const total = tokens.length || 1;
    const vector = new Map<string, number>();
    for (const [term, freq] of termFreq.entries()) {
      vector.set(term, freq / total);
    }

    return vector;
  }

  /**
   * Calculates Cosine Similarity between two term vectors.
   */
  public static cosineSimilarity(vecA: Map<string, number>, vecB: Map<string, number>): number {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (const [term, weight] of vecA.entries()) {
      normA += weight * weight;
      if (vecB.has(term)) {
        dotProduct += weight * vecB.get(term)!;
      }
    }

    for (const weight of vecB.values()) {
      normB += weight * weight;
    }

    if (normA === 0 || normB === 0) {
      return 0;
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * Performs vector similarity search over document text chunks using TF-IDF and Cosine Similarity.
   */
  public static search(
    query: string,
    documents: Array<{ id: string; name: string; content: string }>,
    topK = 5
  ): RAGChunkResult[] {
    if (!query || !query.trim() || !documents || documents.length === 0) {
      return [];
    }

    const queryVector = this.buildTermVector(query);
    if (queryVector.size === 0) {
      return [];
    }

    const results: RAGChunkResult[] = [];

    for (const doc of documents) {
      const chunks = this.chunkText(doc.content);
      chunks.forEach((chunkText, index) => {
        const chunkVector = this.buildTermVector(chunkText);
        const sim = this.cosineSimilarity(queryVector, chunkVector);
        if (sim > 0.01) {
          results.push({
            documentId: doc.id,
            documentName: doc.name,
            chunkIndex: index,
            text: chunkText,
            score: Math.round(sim * 100) / 100,
          });
        }
      });
    }

    // Sort descending by similarity score
    results.sort((a, b) => b.score - a.score);

    return results.slice(0, topK);
  }
}

export default RAGService;
