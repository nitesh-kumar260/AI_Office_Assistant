import { Schema, model, Document as MongooseDocument } from 'mongoose';

export interface IWorkspace extends MongooseDocument {
  name: string;
  memberCount: number;
  tier: 'Enterprise 3D' | 'Professional' | 'Standard';
  code: string;
  createdAt: Date;
  updatedAt: Date;
}

const WorkspaceSchema = new Schema<IWorkspace>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    memberCount: {
      type: Number,
      default: 0,
    },
    tier: {
      type: String,
      enum: ['Enterprise 3D', 'Professional', 'Standard'],
      required: true,
      default: 'Standard',
    },
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Workspace = model<IWorkspace>('Workspace', WorkspaceSchema);
export default Workspace;
