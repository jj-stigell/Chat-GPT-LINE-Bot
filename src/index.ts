// Modules
import { middleware } from '@line/bot-sdk';
import express, { Application } from 'express';

// Project imports
import { lineMiddlewareConfig } from './configuration';
import { connectToDatabase } from './database';
import { PORT } from './environment';
import { loggerMiddleware } from './logger';
import { healthCheck, webhookHandler } from './routes';

export const app: Application = express();

app.use(express.urlencoded({ extended: true }));
app.get('/health', healthCheck);
app.post('/webhook', middleware(lineMiddlewareConfig), webhookHandler);
app.use(loggerMiddleware());

app.listen(PORT, async function () {
  connectToDatabase();
  console.log(`LINE bot started on PORT: ${PORT} 🤖`);
});
