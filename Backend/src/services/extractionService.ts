import { SarvamService } from './sarvamService';
import { DocumentType } from '../models/Extraction';

export interface ExtractionPromptConfig {
  systemPrompt: string;
  defaultFields: Record<string, string>;
}

export class ExtractionService {
  private static getPromptConfig(docType: DocumentType, fileName: string): ExtractionPromptConfig {
    switch (docType) {
      case 'invoice':
        return {
          systemPrompt: `You are an AI data extraction specialist for business invoices.
Extract the following fields from the document text and return ONLY a valid JSON object matching this schema without markdown wrap:
{
  "invoiceNumber": "string e.g. INV-2026-0891",
  "vendorName": "string e.g. AWS Cloud Services",
  "gstin": "string e.g. 27AADCA1234F1Z8 or N/A",
  "billingDate": "YYYY-MM-DD or string date",
  "dueDate": "YYYY-MM-DD or string date",
  "taxableAmount": "formatted amount string e.g. 1,45,200.00",
  "cgst": "formatted amount string e.g. 13,068.00 or N/A",
  "sgst": "formatted amount string e.g. 13,068.00 or N/A",
  "totalAmount": "formatted amount string e.g. 1,71,336.00",
  "paymentStatus": "pending" | "paid" | "overdue"
}`,
          defaultFields: {
            invoiceNumber: 'N/A',
            vendorName: 'Unspecified Vendor',
            gstin: 'N/A',
            billingDate: 'N/A',
            dueDate: 'N/A',
            taxableAmount: '0.00',
            cgst: '0.00',
            sgst: '0.00',
            totalAmount: '0.00',
            paymentStatus: 'pending',
          },
        };

      case 'pan':
        return {
          systemPrompt: `You are an AI document verification specialist for Indian PAN (Permanent Account Number) cards.
Extract the following fields from the document text and return ONLY a valid JSON object matching this schema without markdown wrap:
{
  "panNumber": "10-character alphanumeric PAN string e.g. BHPQK1294F",
  "fullName": "Full Name as printed on card",
  "fatherName": "Father's Name as printed on card",
  "dateOfBirth": "YYYY-MM-DD or DD/MM/YYYY date string",
  "signaturePresent": "true" | "false"
}`,
          defaultFields: {
            panNumber: 'N/A',
            fullName: 'N/A',
            fatherName: 'N/A',
            dateOfBirth: 'N/A',
            signaturePresent: 'true',
          },
        };

      case 'aadhaar':
        return {
          systemPrompt: `You are an AI document verification specialist for Indian Aadhaar cards.
Extract the following fields from the document text and return ONLY a valid JSON object matching this schema without markdown wrap:
{
  "aadhaarNumber": "12-digit Aadhaar number string e.g. 8812 4310 9942",
  "fullName": "Full Name as printed on card",
  "gender": "Male" | "Female" | "Other",
  "dateOfBirth": "YYYY-MM-DD or DD/MM/YYYY date string",
  "address": "Full residential address string"
}`,
          defaultFields: {
            aadhaarNumber: 'N/A',
            fullName: 'N/A',
            gender: 'Unspecified',
            dateOfBirth: 'N/A',
            address: 'N/A',
          },
        };

      case 'gst':
        return {
          systemPrompt: `You are an AI compliance specialist for Indian GST (Goods and Services Tax) registration certificates.
Extract the following fields from the document text and return ONLY a valid JSON object matching this schema without markdown wrap:
{
  "gstin": "15-character GSTIN identifier string",
  "legalName": "Legal Business Name",
  "tradeName": "Trade Name / Operating Name",
  "constitutionOfBusiness": "Private Limited Company | Public Limited | Partnership | Proprietorship",
  "dateOfLiability": "YYYY-MM-DD or date string",
  "registrationType": "Regular" | "Composition" | "Casual"
}`,
          defaultFields: {
            gstin: 'N/A',
            legalName: 'N/A',
            tradeName: 'N/A',
            constitutionOfBusiness: 'Private Limited Company',
            dateOfLiability: 'N/A',
            registrationType: 'Regular',
          },
        };

      default:
        throw new Error(`Unsupported extraction document type: ${docType}`);
    }
  }

  /**
   * Processes a document text using Sarvam AI to extract structured fields.
   */
  public static async extractDocumentData(
    documentText: string,
    documentType: DocumentType,
    fileName: string
  ): Promise<Record<string, any>> {
    if (!documentText || !documentText.trim()) {
      throw new Error('Document contains no readable text content for AI extraction.');
    }

    const config = this.getPromptConfig(documentType, fileName);
    const userPrompt = `Document Name: ${fileName}\nDocument Type: ${documentType.toUpperCase()}\n\nDocument Text:\n${documentText}`;

    // Invoke Sarvam AI chat completion API
    const rawContent = await SarvamService.executeChatCompletion(config.systemPrompt, userPrompt, 0.1);

    // Sanitize and parse JSON response
    let cleanContent = rawContent.trim();
    const firstBrace = cleanContent.indexOf('{');
    const lastBrace = cleanContent.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      cleanContent = cleanContent.substring(firstBrace, lastBrace + 1);
    }

    let parsedData: Record<string, any>;
    try {
      parsedData = JSON.parse(cleanContent);
    } catch (err: any) {
      throw new Error(`Failed to parse AI extraction JSON response: ${err.message}`);
    }

    // Normalize with fallback defaults for missing fields
    const normalized: Record<string, any> = { ...config.defaultFields };
    for (const key of Object.keys(config.defaultFields)) {
      if (parsedData[key] !== undefined && parsedData[key] !== null && String(parsedData[key]).trim() !== '') {
        normalized[key] = parsedData[key];
      }
    }

    return normalized;
  }
}

export default ExtractionService;
