// NOT IN USE

import mongoose, { Schema, Document } from 'mongoose';

export interface IGroup extends Document {
  _id: string;
  messagesSent?: number;
  delete: boolean;
  deleteAt?: Date;
}

export const GroupSchema: Schema = new Schema<IGroup>({
  _id: { type: String, required: true },
  messagesSent: { type: Number, default: 0 },
  delete: { type: Boolean, required: true, default: false },
  deleteAt: { type: Date, required: false }
}, { timestamps: { createdAt: true, updatedAt: false } });

export default mongoose.model<IGroup>('User', GroupSchema);
