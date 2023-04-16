// Modules
import * as dotenv from 'dotenv';
dotenv.config();

export const PORT: number | undefined = Number(process.env.PORT);
export const NODE_ENV: string = process.env.NODE_ENV ?? 'development';
export const LINE_CHANNEL_ACCESS_TOKEN: string = process.env.LINE_CHANNEL_ACCESS_TOKEN ?? '';
export const LINE_CHANNEL_SECRET: string = process.env.LINE_CHANNEL_SECRET ?? '';
export const OPENAI_API_KEY: string | undefined = process.env.OPENAI_API_KEY;
export const OPENAI_ORGANIZATION: string | undefined = process.env.OPENAI_ORGANIZATION;
export const MONGODB_URI: string = process.env.MONGODB_URI ?? '';

if (LINE_CHANNEL_ACCESS_TOKEN.length === 0) {
  throw new Error('LINE_CHANNEL_ACCESS_TOKEN env missing or invalid!');
}

if (!OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY env missing or invalid!');
}

if (MONGODB_URI.length === 0) {
  throw new Error('MONGODB_URI env missing or invalid!');
}

if (LINE_CHANNEL_SECRET.length === 0) {
  throw new Error('LINE_CHANNEL_SECRET env missing or invalid!');
}

if (!PORT) {
  throw new Error('PORT env missing or invalid!');
}
