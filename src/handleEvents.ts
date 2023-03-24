// Modules
import {
  Client, ClientConfig, FollowEvent, Group, JoinEvent, LeaveEvent,
  MessageAPIResponseBase, TextMessage, UnfollowEvent, User, MessageEvent
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

/**
 * Handles message event for bott 1-on-1 and group/mulri-person chats.
 * handleMessageEvent is an asynchronous function that takes a WebhookEvent object as input and
 * processes the message event. It replies only to MessageEvents of type 'text' that start with
 * the {activateBotKeyword}. Upon completion, it returns a Promise containing a MessageAPIResponseBase object or null.
 * @param {WebhookEvent} event - A WebhookEvent object containing the message event information.
 * @returns {Promise<MessageAPIResponseBase | null>} - A Promise containing a MessageAPIResponseBase object or null.
 */
export async function handleMessageEvent(event: MessageEvent): Promise<MessageAPIResponseBase | null> {
  // Reply only to MessageEvents that are type 'text'.
  if (event.type !== 'message' || event.message.type !== 'text') {
    return Promise.resolve(null);
  }

  // TODO: add everything to db.

  // Extract token and prompt from event.
  const replyToken: string = event.replyToken;
  let prompt: string = event.message.text;

  if (event.source.type === 'group') {
    if (!event.message.text.toLowerCase().startsWith(activateBotKeyword)) {
      return Promise.resolve(null);
    }
    // Remove the keyword in front of the prompt when in group/multi-person chats.
    prompt = prompt.substring(activateBotKeyword.length);
  }

  const text: string = prompt.length <= promtCharLimit ? await openAI(prompt) : promptTooLong;

  const response: TextMessage = {
    type: 'text',
    text
  };
  return await client.replyMessage(replyToken, response);
}

/**
 * Handles following LINE user after their request.
 * handleFollowEvent is an asynchronous function that takes a WebhookEvent object as input and processes
 * the follow event. Upon completion, it returns a Promise containing a MessageAPIResponseBase object or null.
 * @param {WebhookEvent} event - A WebhookEvent object containing the follow event information.
 * @returns {Promise<MessageAPIResponseBase | null>} - A Promise containing a MessageAPIResponseBase object or null.
*/
export async function handleFollowEvent(event: FollowEvent): Promise<MessageAPIResponseBase | null> {
  // Extract token and user from the event.
  const replyToken: string = event.replyToken;
  const user: User = event.source as User;
  // TODO: add to db.
  console.log('Bot followed by user id:', user.userId);
  return await client.replyMessage(replyToken, userWelcomeMessage);
}

/**
 * Handles unfollowing LINE user after their request.
 * handleUnfollowEvent is an asynchronous function that takes a WebhookEvent object as input and processes
 * the unfollow event. Upon completion, it returns a Promise containing a null.
 * @param {WebhookEvent} event - A WebhookEvent object containing the unfollow event information.
 * @returns {Promise<null>} - A Promise containing a null.
*/
export async function handleUnfollowEvent(event: UnfollowEvent): Promise<null> {
  // Extract user from the event.
  const user: User = event.source as User;
  console.log('Bot unfollowed by user with id:', user);
  // TODO: remove from db, add to delete queue.
  return Promise.resolve(null);
}

/**
 * Handles joining to a LINE group or multi-person chat.
 * handleFollowEvent is an asynchronous function that takes a WebhookEvent object as input and processes
 * the follow event. Upon completion, it returns a Promise containing a MessageAPIResponseBase object or null.
 * @param {WebhookEvent} event - A WebhookEvent object containing the follow event information.
 * @returns {Promise<MessageAPIResponseBase | null>} - A Promise containing a MessageAPIResponseBase object or null.
*/
export async function handleJoinEvent(event: JoinEvent): Promise<MessageAPIResponseBase | null> {
  // Extract token and group from the event.
  const replyToken: string = event.replyToken;
  const group: Group = event.source as Group;
  // TODO: add to db.
  console.log('Bot joined to group id:', group.groupId);
  return await client.replyMessage(replyToken, groupWelcomeMessage);
}

/**
 * Handles leaving from LINE multi-user or group chat.
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