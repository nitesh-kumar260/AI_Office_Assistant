import { Schema, model, Document as MongooseDocument } from 'mongoose';

export interface ISignee {
  email: string;
  signed: boolean;
  signedAt?: Date;
}

export interface IContractClause {
  name: string;
  summary: string;
  risk: string;
  recommendation: string;
}

export interface IContractAnalysis {
  title: string;
  parties: string[];
  effectiveDate: string;
  expirationDate: string;
  renewalNotice: string;
  contractValue: string;
  overallRisk: number;
  riskLevel: string;
  jurisdiction: string;
  clauses: IContractClause[];
}

export interface IDocument extends MongooseDocument {
  name: string;
  originalName?: string;
  mimeType?: string;
  sizeBytes: number;
  url?: string;
  status: 'uploaded' | 'scanning' | 'completed' | 'failed';
  content?: string;
  ocrContent?: string;
  summary?: string;
  contractAnalysis?: IContractAnalysis;
  signees: ISignee[];
  workspace: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const SigneeSchema = new Schema<ISignee>({
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  signed: {
    type: Boolean,
    default: false,
  },
  signedAt: {
    type: Date,
  },
});

const ContractClauseSchema = new Schema<IContractClause>({
  name: { type: String, required: true },
  summary: { type: String, required: true },
  risk: { type: String, required: true },
  recommendation: { type: String, required: true },
});

const ContractAnalysisSchema = new Schema<IContractAnalysis>({
  title: { type: String, required: true },
  parties: [{ type: String }],
  effectiveDate: { type: String, default: 'N/A' },
  expirationDate: { type: String, default: 'N/A' },
  renewalNotice: { type: String, default: 'N/A' },
  contractValue: { type: String, default: 'N/A' },
  overallRisk: { type: Number, default: 50 },
  riskLevel: { type: String, default: 'Moderate' },
  jurisdiction: { type: String, default: 'Unspecified' },
  clauses: [ContractClauseSchema],
});

const DocumentSchema = new Schema<IDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    originalName: {
      type: String,
      trim: true,
    },
    mimeType: {
      type: String,
      trim: true,
    },
    sizeBytes: {
      type: Number,
      required: true,
    },
    url: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['uploaded', 'scanning', 'completed', 'failed'],
      required: true,
      default: 'uploaded',
    },
    content: {
      type: String,
    },
    ocrContent: {
      type: String,
    },
    summary: {
      type: String,
    },
    contractAnalysis: {
      type: ContractAnalysisSchema,
    },
    signees: [SigneeSchema],
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

export const Doc = model<IDocument>('Document', DocumentSchema);
export default Doc;
