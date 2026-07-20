import { Schema, model, Document as MongooseDocument } from 'mongoose';

export type UserRole = 'admin' | 'legal' | 'executive' | 'auditor';

export interface IUser extends MongooseDocument {
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  title: string;
  organization: string;
  workspaces: Schema.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    role: {
      type: String,
      enum: ['admin', 'legal', 'executive', 'auditor'],
      required: true,
      default: 'legal',
    },
    avatar: {
      type: String,
      trim: true,
    },
    title: {
      type: String,
      trim: true,
    },
    organization: {
      type: String,
      trim: true,
      default: 'Ornitech Intelligence Labs',
    },
    workspaces: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Workspace',
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const User = model<IUser>('User', UserSchema);
export default User;
