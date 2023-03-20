import * as dotenv from 'dotenv';
dotenv.config();

export const PORT: number | undefined = Number(process.env.PORT);
export const LINE_CHANNEL_ACCESS_TOKEN: string = process.env.LINE_CHANNEL_ACCESS_TOKEN ?? '';
export const LINE_CHANNEL_SECRET: string = process.env.LINE_CHANNEL_SECRET ?? '';
export const OPENAI_API_KEY: string | undefined = process.env.OPENAI_API_KEY;

if (LINE_CHANNEL_ACCESS_TOKEN.length === 0) {
  throw new Error('LINE_CHANNEL_ACCESS_TOKEN env missing or invalid!');
}

if (!OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY env missing or invalid!');
}

if (LINE_CHANNEL_SECRET.length === 0) {
  throw new Error('LINE_CHANNEL_SECRET env missing or invalid!');
}

if (!PORT) {
  throw new Error('PORT env missing or invalid!');
}
