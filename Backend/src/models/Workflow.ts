import { Schema, model, Document as MongooseDocument } from 'mongoose';

export interface IWorkflowNode {
  id: string;
  label: string;
  type: 'trigger' | 'process' | 'ai' | 'action';
  desc: string;
  active: boolean;
}

export interface IWorkflow extends MongooseDocument {
  name: string;
  active: boolean;
  nodes: IWorkflowNode[];
  logs: string[];
  workspace: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const WorkflowNodeSchema = new Schema<IWorkflowNode>({
  id: {
    type: String,
    required: true,
  },
  label: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['trigger', 'process', 'ai', 'action'],
    required: true,
  },
  desc: {
    type: String,
  },
  active: {
    type: Boolean,
    default: true,
  },
});

const WorkflowSchema = new Schema<IWorkflow>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
    nodes: [WorkflowNodeSchema],
    logs: [
      {
        type: String,
      },
    ],
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

export const Workflow = model<IWorkflow>('Workflow', WorkflowSchema);
export default Workflow;
