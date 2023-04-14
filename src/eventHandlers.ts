// Modules
import {
  Client, ClientConfig, FollowEvent, Group, JoinEvent, LeaveEvent,
  MessageAPIResponseBase, TextMessage, UnfollowEvent, User as LineUser,
  EventSource, WebhookEvent, TextEventMessage
} from '@line/bot-sdk';

// Project imports
import {
  activateBotKeyword, userWelcomeMessage, groupWelcomeMessage,
  promtCharLimit, promptTooLong, messageLimit, tooManyRequest
} from './configs/configuration';
import { LINE_CHANNEL_SECRET, LINE_CHANNEL_ACCESS_TOKEN } from './configs/environment';
import logger from './configs/winston';
import Message, { IMessage } from './database/models/Message';
import User, { IUser } from './database/models/User';
import openAI, { OpenAiCustomResponse } from './openAI';
import { getFromCache, setToCache } from './util/cache';

const clientConfig: ClientConfig = {
  channelAccessToken: LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: LINE_CHANNEL_SECRET
};

const client: Client = new Client(clientConfig);

/**
 * Handles LINE webhook events by delegating to specific handlers based on event type.
 * @param {WebhookEvent} event - A WebhookEvent object containing the event information.
 * @returns {Promise<MessageAPIResponseBase | undefined>} - A Promise containing a MessageAPIResponseBase
 * object or undefined if no matching handler function.
 */
export function handleEvent(event: WebhookEvent): Promise<MessageAPIResponseBase | undefined> {
  switch (event.type) {
  case 'message':
    switch (event.message.type) {
    case 'text':
      return handleTextEvent(event.message, event.replyToken, event.source);
    default:
      logger.warn(`Unsupported event type: ${event.message.type}`);
      return Promise.resolve(undefined);
    }
  case 'follow':
    return handleFollowEvent(event);
  case 'unfollow':
    return handleUnfollowEvent(event);
  case 'join':
    return handleJoinEvent(event);
  case 'leave':
    return handleLeaveEvent(event);
  default:
    logger.warn(`Unsupported event type: ${event.type}`);
    return Promise.resolve(undefined);
  }
}

/**
 * Handles message event for both, 1-on-1 and group/multi-person chats.
 * handleMessageEvent is an asynchronous function that takes a WebhookEvent object as input and
 * processes the message event. It replies only to MessageEvents of type 'text' that start with
 * the {activateBotKeyword}. Upon completion, it returns a Promise containing
 * a MessageAPIResponseBase object or undefined.
 * @param {TextEventMessage} message - A TextEventMessage object containing the message event information.
 * @param {string} replyToken - Reply specific token, required for succesful replyMessage.
 * @param {EventSource} source - Event source information, describes source type (User | Group | Room).
 * @returns {Promise<MessageAPIResponseBase | undefined>} - A Promise containing a MessageAPIResponseBase
 * object or undefined.
 */
export async function handleTextEvent(
  message: TextEventMessage, replyToken: string, source: EventSource
): Promise<MessageAPIResponseBase | undefined> {

  let conversationId: string = '-';
  let prompt: string = message.text;
  let tokensUsed: number = 0;

  const response: TextMessage = {
    type: 'text',
    text: promptTooLong
  };

  logger.info(`New message event received, payload:"${prompt}", length: ${prompt.length}.`);

  // Check for promt limit.
  if (prompt.length > promtCharLimit) {
    return client.replyMessage(replyToken, response);
  }

  if (source.type === 'group') {
    if (!message.text.toLowerCase().startsWith(activateBotKeyword)) {
      return;
    }
    // Remove the keyword in front of the prompt when in group/multi-person chats.
    prompt = prompt.substring(activateBotKeyword.length);
    conversationId = source.groupId;
  } else if (source.type === 'user') {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    conversationId = source.userId;
  }

  // Count user/group messages to the bot.
  const count: number = await Message.countDocuments({
    conversationId: conversationId,
    createdAt: {
      $gte: Date.now() - (24 * 60 * 60 * 1000)
    }
  });

  // Check that user message limit not hit.
  if (count > messageLimit) {
    response.text = tooManyRequest;
    return client.replyMessage(replyToken, response);
  }

  // Check cache for the user prompt.
  const text: string | undefined = getFromCache(prompt);

  if (!text) {
    logger.info('No cached prompt found!');

    const openAIResponse: OpenAiCustomResponse = await openAI(prompt);
    response.text = openAIResponse.promptReply;
    tokensUsed = openAIResponse.tokensUsed;

    // Set to the cache.
    setToCache(prompt, response.text);
  } else {
    logger.info('Cached hit, previous prompt found!');
    response.text = text;
  }

  let userFromDb: IUser | null = await User.findById({ _id: conversationId });

  if (!userFromDb) {
    userFromDb = new User({
      _id: conversationId,
      messagesSent: 1
    });
  } else {
    userFromDb.messagesSent = userFromDb.messagesSent as number + 1;
  }
  await userFromDb.save();

  // Log the message.
  const newMessage: IMessage = new Message({
    conversationId,
    message: prompt,
    aiReply: response.text,
    tokensUsed
  });
  await newMessage.save();

  return client.replyMessage(replyToken, response);
}

/**
 * Handles following LINE user after their request. Send introduction message to the user.
 * Adds user data to the database. If user has previously unfollowed the bot and data is
 * marked delete but this process is not yet completed, sets data deletion to false.
 * handleFollowEvent is an asynchronous function that takes a WebhookEvent object as input and processes
 * the follow event. Upon completion, it returns a Promise containing a MessageAPIResponseBase object.
 * @param {FollowEvent} event - A FollowEvent object containing the follow event information.
 * @returns {Promise<MessageAPIResponseBase>} - A Promise containing a MessageAPIResponseBase object.
*/
export async function handleFollowEvent(event: FollowEvent): Promise<MessageAPIResponseBase> {
  // Extract token and user from the event.
  const replyToken: string = event.replyToken;
  const user: LineUser = event.source as LineUser;

  // Check if user exists in db.
  const userFromDb: IUser | null = await User.findById({ _id: user.userId });

  if (userFromDb) {
    // Uset the deletion condition.
    userFromDb.delete = false;
    await userFromDb.save();
    logger.info(`Bot followed by existing user id: ${user.userId}`);
  } else {
    // Add new user to the db.
    const newUser: IUser = new User({
      _id: user.userId
    });
    await newUser.save();
    logger.info(`Bot followed by new user id: ${user.userId}`);
  }

  return client.replyMessage(replyToken, userWelcomeMessage);
}

/**
 * Handles unfollowing LINE user after their request. Sets user data in the database for deletion.
 * handleUnfollowEvent is an asynchronous function that takes a WebhookEvent object as input and processes
 * the unfollow event. Upon completion, it returns a Promise containing a undefined.
 * @param {UnfollowEvent} event - A UnfollowEvent object containing the unfollow event information.
 * @returns {Promise<undefined>} - A Promise containing a undefined.
*/
export async function handleUnfollowEvent(event: UnfollowEvent): Promise<undefined> {
  // Extract user from the event.
  const user: LineUser = event.source as LineUser;

  // Add user to delete queue.
  await User.updateOne(
    { _id: user.userId },
    {
      $set: {
        delete: true,
        deleteAt: Date.now() + 24 * 60 * 60 * 1000
      }
    }
  );
  logger.info(`Bot unfollowed by user id: ${user.userId}`);

  return;
}

/**
 * Handles joining to a LINE group or multi-person chat. Send introduction message to the group.
 * Adds group data to the database. If group has previously removed the bot from chat and data is
 * marked delete but this process is not yet completed, sets data deletion to false.
 * handleFollowEvent is an asynchronous function that takes a WebhookEvent object as input and processes
 * the follow event. Upon completion, it returns a Promise containing a MessageAPIResponseBase object.
 * @param {JoinEvent} event - A JoinEvent object containing the follow event information.
 * @returns {Promise<MessageAPIResponseBase>} - A Promise containing a MessageAPIResponseBase object.
*/
export async function handleJoinEvent(event: JoinEvent): Promise<MessageAPIResponseBase> {
  // Extract token and group from the event.
  const replyToken: string = event.replyToken;
  const group: Group = event.source as Group;
  // TODO: add to db.
  logger.info(`Bot joined to group id: ${group.groupId}`);
  return client.replyMessage(replyToken, groupWelcomeMessage);
}

/**
 * Handles leaving from LINE multi-user or group chat. Sets group data in the database for deletion.
 * handleLeaveEvent is an asynchronous function that takes a WebhookEvent object as input and processes
 * the leave event. Upon completion, it returns a Promise containing a undefined.
 * @param {LeaveEvent} event - A LeaveEvent object containing the leave event information.
 * @returns {Promise<undefined>} - A Promise containing a undefined.
*/
export async function handleLeaveEvent(event: LeaveEvent): Promise<undefined> {
  const source: Group = event.source as Group;
  const groupId: string = source.groupId;
  logger.info(`Bot leaving from group id: ${groupId}`);
  // TODO: remove from db, add to delete queue.
  return;
}
