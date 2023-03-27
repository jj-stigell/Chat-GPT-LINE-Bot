// Modules
import {
  Client, ClientConfig, FollowEvent, Group, JoinEvent, LeaveEvent,
  MessageAPIResponseBase, TextMessage, UnfollowEvent, User, EventSource, WebhookEvent, TextEventMessage
} from '@line/bot-sdk';
import NodeCache from 'node-cache';

// Project imports
import {
  activateBotKeyword, userWelcomeMessage, groupWelcomeMessage, promtCharLimit, promptTooLong, nodeCacheOptions
} from './configuration';
import { LINE_CHANNEL_SECRET, LINE_CHANNEL_ACCESS_TOKEN } from './environment';
import { openAI } from './openAI';

const clientConfig: ClientConfig = {
  channelAccessToken: LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: LINE_CHANNEL_SECRET
};

const client: Client = new Client(clientConfig);
const promptCache: NodeCache = new NodeCache(nodeCacheOptions);

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
      console.log(`Unsupported event type: ${event.message.type}`);
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
    console.log(`Unsupported event type: ${event.type}`);
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

  // TODO: add everything to db.
  let conversationId: string = '-';
  let prompt: string = message.text;

  // Check cache for the user prompt.
  let text: string | undefined = promptCache.get(prompt);

  const response: TextMessage = {
    type: 'text',
    text: text ?? ''
  };

  if (!text) {
    console.log('No cached prompt found!');

    if (source.type === 'group') {
      if (!message.text.toLowerCase().startsWith(activateBotKeyword)) {
        return;
      }
      // Remove the keyword in front of the prompt when in group/multi-person chats.
      prompt = prompt.substring(activateBotKeyword.length);
      conversationId = source.groupId;
    } else if (source.type === 'user') {
      conversationId = source.userId;
    }

    text = prompt.length <= promtCharLimit ? await openAI(prompt, conversationId) : promptTooLong;
    response.text = text;

    // Add to cache.
    promptCache.set(prompt, text);

    return client.replyMessage(replyToken, response);
  } else {
    console.log('Prompt found from cache!');
    return client.replyMessage(replyToken, response);
  }
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
  const user: User = event.source as User;
  // TODO: add to db.
  console.log('Bot followed by user id:', user.userId);
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
  const user: User = event.source as User;
  console.log('Bot unfollowed by user with id:', user.userId);
  // TODO: remove from db, add to delete queue.
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
  console.log('Bot joined to group id:', group.groupId);
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
  console.log('Bot leaving from group id:', groupId);
  // TODO: remove from db, add to delete queue.
  return;
}
