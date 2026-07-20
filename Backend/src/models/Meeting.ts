import { Schema, model, Document as MongooseDocument } from 'mongoose';

export interface IMeetingAction {
  task: string;
  assignee: string;
  priority: 'High' | 'Medium' | 'Low';
  due: string;
  completed: boolean;
}

export interface ITranscriptSegment {
  speaker: string;
  text: string;
}

export interface IMeeting extends MongooseDocument {
  name: string;
  length: string; // e.g. "14:32"
  speakers: string[];
  takeaways: string[];
  actions: IMeetingAction[];
  transcript: ITranscriptSegment[];
  workspace: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const MeetingActionSchema = new Schema<IMeetingAction>({
  task: {
    type: String,
    required: true,
  },
  assignee: {
    type: String,
    required: true,
  },
  priority: {
    type: String,
    enum: ['High', 'Medium', 'Low'],
    default: 'Medium',
  },
  due: {
    type: String,
  },
  completed: {
    type: Boolean,
    default: false,
  },
});

const TranscriptSegmentSchema = new Schema<ITranscriptSegment>({
  speaker: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
});

const MeetingSchema = new Schema<IMeeting>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    length: {
      type: String,
      required: true,
    },
    speakers: [
      {
        type: String,
      },
    ],
    takeaways: [
      {
        type: String,
      },
    ],
    actions: [MeetingActionSchema],
    transcript: [TranscriptSegmentSchema],
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

export const Meeting = model<IMeeting>('Meeting', MeetingSchema);
export default Meeting;
