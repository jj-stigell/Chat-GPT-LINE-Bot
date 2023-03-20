import * as dotenv from 'dotenv';
dotenv.config();

export const PORT: number | undefined = Number(process.env.PORT);
export const LINE_CHANNEL_ACCESS_TOKEN: string = process.env.LINE_CHANNEL_ACCESS_TOKEN ?? '';
export const LINE_CHANNEL_SECRET: string = process.env.LINE_CHANNEL_SECRET ?? '';
export const OPENAI_API_KEY: string | undefined = process.env.OPENAI_API_KEY;

if (
  LINE_CHANNEL_ACCESS_TOKEN.length === 0 ||
  !OPENAI_API_KEY ||
  LINE_CHANNEL_SECRET.length === 0 ||
  !PORT) {
  throw new Error('Production required env(s) missing or invalid!');
}
