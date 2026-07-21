import { Schema, model, Document as MongooseDocument } from 'mongoose';

export interface ISignee {
  email: string;
  signed: boolean;
  signedAt?: Date;
}

export interface IDocument extends MongooseDocument {
  name: string;
  sizeBytes: number;
  url?: string;
  status: 'uploaded' | 'scanning' | 'completed' | 'failed';
  ocrContent?: string;
  summary?: string;
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

const DocumentSchema = new Schema<IDocument>(
  {
    name: {
      type: String,
      required: true,
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
    ocrContent: {
      type: String,
    },
    summary: {
      type: String,
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
