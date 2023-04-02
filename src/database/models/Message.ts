import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
  _id: string;
  conversationId: string;
  message: string;
  aiReply: string;
  tokensUsed: number;
}

export const MessageSchema: Schema = new Schema<IMessage>({
  conversationId: { type: String, required: true },
  message: { type: String, required: true },
  aiReply: { type: String, required: true },
  tokensUsed: { type: Number, required: true },
},  { timestamps: { createdAt: true, updatedAt: false } });

export default mongoose.model<IMessage>('Message', MessageSchema);
