import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
  _id: string;
  conversationId: string;
  content: string;
}

export const MessageSchema: Schema = new Schema<IMessage>({
  _id: { type: String, required: true },
  conversationId: { type: String, required: true },
  content: { type: String },
},  { timestamps: { createdAt: true, updatedAt: false } });

export default mongoose.model<IMessage>('Message', MessageSchema);
