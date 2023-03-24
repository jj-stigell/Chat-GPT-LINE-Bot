import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  _id: string;
  messagesSent?: number;
  delete: boolean;
  deleteAt: Date;
}

export const UserSchema: Schema = new Schema<IUser>({
  _id: { type: String, required: true },
  messagesSent: { type: Number, default: 0 },
  delete: { type: Boolean, required: true },
  deleteAt: { type: Date, required: true }
}, { timestamps: true });

export default mongoose.model<IUser>('User', UserSchema);
