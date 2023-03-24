import { Document, model, Schema } from 'mongoose';

export interface IOpenAIRequest extends Document {
  _id: string;
  conversationId: string; // Either user id or group id.
  message: string;
  tokensUsed: number;
}

export const OpenAIRequestSchema: Schema = new Schema<IOpenAIRequest>({
  _id: { type: String, required: true },
  conversationId: { type: String, required: true },
  message: { type: String, required: true },
  tokensUsed: { type: Number, required: true },
},  { timestamps: { createdAt: true, updatedAt: false } });

export default model<IOpenAIRequest>('OpenAIRequest', OpenAIRequestSchema);
