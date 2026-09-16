export interface ContractClause {
  name: string;
  summary: string;
  risk: 'Low' | 'Medium' | 'High';
  recommendation: string;
}

export interface ContractAnalysis {
  title: string;
  parties: string[];
  effectiveDate: string;
  expirationDate: string;
  renewalNotice: string;
  contractValue: string;
  overallRisk: number;
  riskLevel: 'Low' | 'Moderate' | 'High' | 'Critical';
  jurisdiction: string;
  clauses: ContractClause[];
}

export class SarvamService {
  private static getApiKey(): string {
    const apiKey = process.env.SARVAM_API_KEY;
    if (!apiKey || apiKey.trim() === '' || apiKey.trim() === 'YOUR_SARVAM_API_KEY_HERE') {
      throw new Error(
        'SARVAM_API_KEY is not configured in backend environment variables. Please set SARVAM_API_KEY in your backend environment.'
      );
    }
    return apiKey.trim();
  }

  /**
   * Reusable chat completion caller for Sarvam AI API.
   */
  public static async executeChatCompletion(
    systemPrompt: string,
    userPrompt: string,
    temperature = 0.2
  ): Promise<string> {
    const apiKey = this.getApiKey();

    const response = await fetch('https://api.sarvam.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-subscription-key': apiKey,
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'sarvam-2b',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Sarvam AI API error (${response.status}): ${errText}`);
    }

    const data: any = await response.json();
    const content = data?.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('Sarvam AI returned an empty response.');
    }

    return content.trim();
  }

  /**
   * Summarizes a contract using Sarvam AI Chat Completions API.
   */
  public static async summarizeContract(contractText: string, documentName: string): Promise<ContractAnalysis> {
    const apiKey = this.getApiKey();

    const systemPrompt = `You are an expert legal AI contract analyst.
Analyze the contract text provided and extract structured contract information, legal risk metrics, critical milestone dates, financial obligations, jurisdiction, and clause breakdowns.

Return ONLY a valid JSON object matching this exact schema without markdown wrap or extra commentary:
{
  "title": "Clean concise contract title",
  "parties": ["Party 1 Name", "Party 2 Name"],
  "effectiveDate": "e.g. August 1, 2026",
  "expirationDate": "e.g. July 31, 2028",
  "renewalNotice": "e.g. 60 Days Prior",
  "contractValue": "e.g. $480,000 USD / Year",
  "overallRisk": 78,
  "riskLevel": "Low" | "Moderate" | "High" | "Critical",
  "jurisdiction": "e.g. Delaware, USA",
  "clauses": [
    {
      "name": "1. Clause Title",
      "summary": "Detailed summary of clause terms...",
      "risk": "Low" | "Medium" | "High",
      "recommendation": "Actionable legal recommendation..."
    }
  ]
}`;

    const userPrompt = `Document Name: ${documentName}\n\nContract Text:\n${contractText}`;

    try {
      const response = await fetch('https://api.sarvam.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-subscription-key': apiKey,
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'sarvam-2b',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.2,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Sarvam AI API error (${response.status}): ${errText}`);
      }

      const data: any = await response.json();
      const content = data?.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error('Sarvam AI returned an empty response.');
      }

      // Sanitize JSON content in case the model outputs markdown code blocks or prose around JSON
      let cleanContent = content.trim();
      const firstBrace = cleanContent.indexOf('{');
      const lastBrace = cleanContent.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        cleanContent = cleanContent.substring(firstBrace, lastBrace + 1);
      }
      const parsed: ContractAnalysis = JSON.parse(cleanContent);

      return {
        title: parsed.title || documentName,
        parties: Array.isArray(parsed.parties) ? parsed.parties : ['Party A', 'Party B'],
        effectiveDate: parsed.effectiveDate || 'N/A',
        expirationDate: parsed.expirationDate || 'N/A',
        renewalNotice: parsed.renewalNotice || 'N/A',
        contractValue: parsed.contractValue || 'N/A',
        overallRisk: typeof parsed.overallRisk === 'number' ? parsed.overallRisk : 75,
        riskLevel: parsed.riskLevel || 'Moderate',
        jurisdiction: parsed.jurisdiction || 'Unspecified',
        clauses: Array.isArray(parsed.clauses) ? parsed.clauses : [],
      };
    } catch (err: any) {
      if (err instanceof SyntaxError) {
        throw new Error(`Failed to parse JSON response from Sarvam AI: ${err.message}`);
      }
      throw err;
    }
  }

  /**
   * Handles Contract Copilot Q&A using Sarvam AI.
   */
  public static async askContractCopilot(
    contractText: string,
    userQuestion: string,
    history: Array<{ sender: 'user' | 'ai'; text: string }> = []
  ): Promise<string> {
    const apiKey = this.getApiKey();

    const formattedHistory = history.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.text,
    }));

    const systemMessage = {
      role: 'system',
      content: `You are Contract Copilot, a helpful AI legal assistant. Answer the user's questions about the contract text clearly, accurately, and professionally. Base your responses strictly on the provided contract details.\n\nContract Text:\n${contractText}`,
    };

    try {
      const response = await fetch('https://api.sarvam.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-subscription-key': apiKey,
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'sarvam-2b',
          messages: [
            systemMessage,
            ...formattedHistory,
            { role: 'user', content: userQuestion },
          ],
          temperature: 0.3,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Sarvam AI API error (${response.status}): ${errText}`);
      }

      const data: any = await response.json();
      const content = data?.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error('Sarvam AI returned an empty response.');
      }

      return content.trim();
    } catch (err: any) {
      throw err;
    }
  }
}
