// Modules
import {
  Client, ClientConfig, FollowEvent, Group, JoinEvent, LeaveEvent,
  MessageAPIResponseBase, TextMessage, UnfollowEvent, User, EventSource, WebhookEvent, TextEventMessage
} from '@line/bot-sdk';

// Project imports
import {
  activateBotKeyword, userWelcomeMessage, groupWelcomeMessage, promtCharLimit, promptTooLong
} from './configuration';
import { LINE_CHANNEL_SECRET, LINE_CHANNEL_ACCESS_TOKEN } from './environment';
import { openAI } from './openAI';

const clientConfig: ClientConfig = {
  channelAccessToken: LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: LINE_CHANNEL_SECRET
};

const client: Client = new Client(clientConfig);









export function handleEvent(event: WebhookEvent): Promise<MessageAPIResponseBase | null> {
  switch (event.type) {
  case 'message':
    switch (event.message.type) {
    case 'text':
      return handleTextEvent(event.message, event.replyToken, event.source);
    default:
      console.log(`Unsupported event type: ${event.message.type}`);
      return Promise.resolve(null);
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
    console.log(`Unsupported event type: ${event.type}`);
    return Promise.resolve(null);
  }
}















/**
 * Handles message event for both, 1-on-1 and group/multi-person chats.
 * handleMessageEvent is an asynchronous function that takes a WebhookEvent object as input and
 * processes the message event. It replies only to MessageEvents of type 'text' that start with
 * the {activateBotKeyword}. Upon completion, it returns a Promise containing a MessageAPIResponseBase object or null.
 * @param {WebhookEvent} event - A WebhookEvent object containing the message event information.
 * @returns {Promise<MessageAPIResponseBase | null>} - A Promise containing a MessageAPIResponseBase object or null.
 */
export async function handleTextEvent(
  message: TextEventMessage, replyToken: string, source: EventSource
): Promise<MessageAPIResponseBase | null> {

  // TODO: add everything to db.
  let conversationId: string = '-';
  let prompt: string = message.text;

  if (source.type === 'group') {
    if (!message.text.toLowerCase().startsWith(activateBotKeyword)) {
      return Promise.resolve(null);
    }
    // Remove the keyword in front of the prompt when in group/multi-person chats.
    prompt = prompt.substring(activateBotKeyword.length);
    conversationId = source.groupId;
  } else if (source.type === 'user') {
    conversationId = source.userId;
  }

  const text: string = prompt.length <= promtCharLimit ? await openAI(prompt, conversationId) : promptTooLong;

  const response: TextMessage = {
    type: 'text',
    text
  };
  return client.replyMessage(replyToken, response);
}

/**
 * Handles following LINE user after their request. Send introduction message to the user.
 * Adds user data to the database. If user has previously unfollowed the bot and data is
 * marked delete but this process is not yet completed, sets data deletion to false.
 * handleFollowEvent is an asynchronous function that takes a WebhookEvent object as input and processes
 * the follow event. Upon completion, it returns a Promise containing a MessageAPIResponseBase object or null.
 * @param {WebhookEvent} event - A WebhookEvent object containing the follow event information.
 * @returns {Promise<MessageAPIResponseBase | null>} - A Promise containing a MessageAPIResponseBase object or null.
*/
export async function handleFollowEvent(event: FollowEvent): Promise<MessageAPIResponseBase> {
  // Extract token and user from the event.
  const replyToken: string = event.replyToken;
  const user: User = event.source as User;
  // TODO: add to db.
  console.log('Bot followed by user id:', user.userId);
  return client.replyMessage(replyToken, userWelcomeMessage);
}

/**
 * Handles unfollowing LINE user after their request. Sets user data in the database for deletion.
 * handleUnfollowEvent is an asynchronous function that takes a WebhookEvent object as input and processes
 * the unfollow event. Upon completion, it returns a Promise containing a null.
 * @param {WebhookEvent} event - A WebhookEvent object containing the unfollow event information.
 * @returns {Promise<null>} - A Promise containing a null.
*/
export async function handleUnfollowEvent(event: UnfollowEvent): Promise<null> {
  // Extract user from the event.
  const user: User = event.source as User;
  console.log('Bot unfollowed by user with id:', user.userId);
  // TODO: remove from db, add to delete queue.
  return Promise.resolve(null);
}

/**
 * Handles joining to a LINE group or multi-person chat. Send introduction message to the group.
 * Adds group data to the database. If group has previously removed the bot from chat and data is
 * marked delete but this process is not yet completed, sets data deletion to false.
 * handleFollowEvent is an asynchronous function that takes a WebhookEvent object as input and processes
 * the follow event. Upon completion, it returns a Promise containing a MessageAPIResponseBase object or null.
 * @param {WebhookEvent} event - A WebhookEvent object containing the follow event information.
 * @returns {Promise<MessageAPIResponseBase | null>} - A Promise containing a MessageAPIResponseBase object or null.
*/
export async function handleJoinEvent(event: JoinEvent): Promise<MessageAPIResponseBase> {
  // Extract token and group from the event.
  const replyToken: string = event.replyToken;
  const group: Group = event.source as Group;
  // TODO: add to db.
  console.log('Bot joined to group id:', group.groupId);
  return client.replyMessage(replyToken, groupWelcomeMessage);
}

/**
 * Handles leaving from LINE multi-user or group chat. Sets group data in the database for deletion.
 * handleLeaveEvent is an asynchronous function that takes a WebhookEvent object as input and processes
 * the leave event. Upon completion, it returns a Promise containing a null.
 * @param {WebhookEvent} event - A WebhookEvent object containing the leave event information.
 * @returns {Promise<null>} - A Promise containing a null.
*/
export async function handleLeaveEvent(event: LeaveEvent): Promise<null> {
  const source: Group = event.source as Group;
  const groupId: string = source.groupId;
  console.log('Bot leaving from group id:', groupId);
  // TODO: remove from db, add to delete queue.
  return Promise.resolve(null);
}
