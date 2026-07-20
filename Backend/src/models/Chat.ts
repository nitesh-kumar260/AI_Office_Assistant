import { Schema, model, Document as MongooseDocument } from 'mongoose';

export interface IMessage {
  senderName: string;
  role: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: Date;
}

export interface IChatSession extends MongooseDocument {
  sessionName: string;
  messages: IMessage[];
  workspace: Schema.Types.ObjectId;
  user: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>({
  senderName: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['user', 'assistant', 'system'],
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const ChatSessionSchema = new Schema<IChatSession>(
  {
    sessionName: {
      type: String,
      required: true,
      trim: true,
      default: 'New Chat Session',
    },
    messages: [MessageSchema],
    workspace: {
      type: Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const ChatSession = model<IChatSession>('ChatSession', ChatSessionSchema);
export default ChatSession;
