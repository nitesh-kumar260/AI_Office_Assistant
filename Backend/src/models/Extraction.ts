import { Schema, model, Document as MongooseDocument } from 'mongoose';

export type DocumentType = 'invoice' | 'pan' | 'aadhaar' | 'gst';

export interface IExtraction extends MongooseDocument {
  documentType: DocumentType;
  fileName: string;
  extractedData: Record<string, any>;
  workspace: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ExtractionSchema = new Schema<IExtraction>(
  {
    documentType: {
      type: String,
      enum: ['invoice', 'pan', 'aadhaar', 'gst'],
      required: true,
    },
    fileName: {
      type: String,
      required: true,
      trim: true,
    },
    extractedData: {
      type: Schema.Types.Mixed,
      required: true,
      default: {},
    },
    workspace: {
      type: Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Extraction = model<IExtraction>('Extraction', ExtractionSchema);
export default Extraction;
