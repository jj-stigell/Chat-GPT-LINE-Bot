// Modules
import {  WebhookEvent } from '@line/bot-sdk';
import { NextFunction, Request, Response } from 'express';
import logger from './configs/winston';
import Message, { IMessage } from './database/models/Message';

// Project imports
import { handleEvent } from './eventHandlers';

// Health check endpoint.
export function healthCheck(req: Request, res: Response, next: NextFunction): void {
  res.status(200).send();
  next();
}

export async function test(req: Request, res: Response, next: NextFunction): Promise<void> {
  const conversationId: string = req.params.conversationId;

  const count: number = await Message.countDocuments({
    conversationId,
    createdAt: { $gte: Date.now() - (24 * 60 * 60 * 1000) },
  });

  const messages: Array<IMessage> = await Message.find({ conversationId }).sort({ createdAt: 'desc' }).limit(10);

  res.status(200).send({
    conversationId,
    count,
    messages
  });
  next();
}

export async function webhookHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  if (!Array.isArray(req.body.events)) {
    res.status(500).end();
    next();
  }
  const events: Array<WebhookEvent> = req.body.events;
  logger.info(`${events.length} new LINE events: ${events}`);

  // Process all of the received events asynchronously.
  Promise.all(events.map(handleEvent))
    .then(() => {
      logger.info('All events processed succesfully!');
      res.status(200).send();
    })
    .catch((err: unknown) => {
      if (err instanceof Error) {
        logger.error(err.message);
      } else {
        logger.error(err);
      }
      res.status(500).end();
    });
  next();
}
