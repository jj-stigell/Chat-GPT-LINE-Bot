// Modules
import { NextFunction, Request, Response } from 'express';
import Message, { IMessage } from './database/models/Message';

// Project imports
import { hashValue } from './util/hash';

export async function testGetUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  const conversationId: string = req.params.conversationId ?? '-';

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

export async function testHash(req: Request, res: Response, next: NextFunction): Promise<void> {
  const message: string = req.body.message;
  const hash: string = hashValue(message);
  const compare: string = `message takes ${(new TextEncoder().encode(message)).length} bytes,`
  + `hash takes ${(new TextEncoder().encode(hash)).length} bytes`;

  res.status(200).send({
    compare,
    message,
    hash,
  });
  next();
}
