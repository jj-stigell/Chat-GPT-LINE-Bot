import * as dotenv from 'dotenv';
dotenv.config();

export const PORT: number | undefined = Number(process.env.PORT);
export const LINE_CHANNEL_TOKEN: string | undefined = process.env.LINE_CHANNEL_TOKEN;
export const OPENAI_API_KEY: string | undefined = process.env.OPENAI_API_KEY;

if (!LINE_CHANNEL_TOKEN || !OPENAI_API_KEY || !PORT) {
  throw new Error('Production required env(s) missing!');
}
