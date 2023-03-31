// Modules
import {  WebhookEvent } from '@line/bot-sdk';
import { NextFunction, Request, Response } from 'express';

// Project imports
import { handleEvent } from './eventHandlers';

// Health check endpoint.
export function healthCheck(req: Request, res: Response, next: NextFunction): void {
  //console.log('ips', req.ips);
  //console.log('sokcet', req.socket.remoteAddress);
  //console.log('ip',req.ip);
  res.status(200).send();
  next();
}

export async function webhookHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  if (!Array.isArray(req.body.events)) {
    res.status(500).end();
    next();
  }
  const events: Array<WebhookEvent> = req.body.events;
  console.log('LINE events:', events);

  // Process all of the received events asynchronously.
  Promise.all(events.map(handleEvent))
    .then(() => {
      res.status(200).send();
    })
    .catch((err: unknown) => {
      console.error(err);
      res.status(500).end();
    });
  next();
}