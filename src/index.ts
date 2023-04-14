// Modules
import { middleware } from '@line/bot-sdk';
import express, { Application } from 'express';

// Project imports
import { lineMiddlewareConfig } from './configs/configuration';
import { connectToDatabase } from './database';
import { PORT } from './configs/environment';
import { populateCache } from './util/cache';
import loggerMiddleware from './middleware/loggerMiddleware';
import { healthCheck, test, testHash, webhookHandler } from './controllers';

export const app: Application = express();

app.use(express.urlencoded({ extended: true }));
app.use(loggerMiddleware);
app.get('/health', healthCheck);
app.get('/test/:conversationId', test);
app.get('/test/hash/:message', testHash);
app.post('/webhook', middleware(lineMiddlewareConfig), webhookHandler);

app.listen(PORT, async function () {
  populateCache();
  connectToDatabase();
  console.log(`LINE bot started on PORT: ${PORT} 🤖`);
});
