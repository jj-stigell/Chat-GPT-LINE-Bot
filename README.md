# LINE Bot server

## Table of Contents
  * [Webhook events](#webhook-events)
  * [Webhook redelivery option](#webhook-redelivery-option)
  * [Bot functionality](#bot-functionality)
    * [1-on-1 chats](#1-on-1-chats)
      * [User bot workflow](#user-bot-workflow)
    * [Group chats](#group-chats)
      * [Group bot workflow](#group-bot-workflow)
    * [Data deletion](#data-deletion)


## Webhook events

[LINE documentation](https://developers.line.biz/en/docs/messaging-api/receiving-messages/#webhook-event-types) for webhook events.

| Event type | Description | 1-on-1 chats | Group chats and multi-person chats |
|------------|-------------|--------------|------------------------------------|
| [Message event](https://developers.line.biz/en/reference/messaging-api/#message-event) | Indicates that the user sent a message. You can reply to this event.                                                |      ✅      |                 ✅                |
| [Unsend event](https://developers.line.biz/en/reference/messaging-api/#unsend-event) | Indicates that the user unsent a message.                                                                            |      ✅      |                 ✅                |
| [Follow event](https://developers.line.biz/en/reference/messaging-api/#follow-event) | Indicates that your LINE Official Account was added as a friend (or unblocked). You can reply to this event.         |      ✅      |                 ❌                |
| [Unfollow event](https://developers.line.biz/en/reference/messaging-api/#unfollow-event) | Indicates that your LINE Official Account was blocked.                                                               |      ✅      |                 ❌                |
| [Join event](https://developers.line.biz/en/reference/messaging-api/#join-event) | Indicates that your LINE Official Account joined a group chat or multi-person chat. You can reply to this event.   |      ❌      |                 ✅                |
| [Leave event](https://developers.line.biz/en/reference/messaging-api/#leave-event) | Indicates that the user either deleted your LINE Official Account from the group chat, or the LINE Official Account has left the group chat or multi-person chat. |      ❌      |                 ✅                |
| [Member join event](https://developers.line.biz/en/reference/messaging-api/#member-joined-event) | Indicates that the user joined a group chat or multi-person chat of which your LINE Official Account is a member. You can reply to this event. |      ❌      |                 ✅                |
| [Member leave event](https://developers.line.biz/en/reference/messaging-api/#member-left-event) | Indicates that the user left a group chat or multi-person chat of which your LINE Official Account is a member.      |      ❌      |                 ✅                |
| [Postback event](https://developers.line.biz/en/reference/messaging-api/#postback-event) | Indicates that the user performed a postback action. You can reply to this event.                                   |      ✅      |                 ✅                |
| [Video viewing complete event](https://developers.line.biz/en/reference/messaging-api/#video-viewing-complete) | Indicates that the user finished watching the video message with the specified trackingId sent from the LINE Official account. You can reply to this event. |      ✅      |                 ❌                |

<br>

## Webhook redelivery option

Before enabling Webhook redelivery option
Caution: Before enabling the Webhook redelivery option, check the following points:

Due to network routing problems and other factors, duplicate webhook events may be sent. If this is an issue, use webhook event ID to detect duplicates.
If webhook events are redelivered, the order in which webhook events occur and the order in which they reach the bot server can be different significantly. If this is an issue, check the context by looking at the timestamp of webhook events.

<br>

## Bot functionality

Describes bot functionality in bot user and group chats.

<br>

### 1-on-1 chats

When user is chatting alone in private conversation with the bot.

<br>

#### User bot workflow

1. User adds the bot as friend.
3. [Follow event](#events) send by LINE webhook to server:
    1. Check if user id exists in the database, if not create new user.
    2. If user exists and is previously marked for deletion, set deletion to `false`.
3. Chat window opens, bot will send welcome message, including link to privacy policy and ToS.
4. User sends a [Message event](#events) to the chat.
5. Message is relayed to the bot server where:
    1. Message is stored in the database (1-on-1 table) with user id as the key.
    2. Message is sent to the OpenAI via API.
    3. Response is received from OpenAI API.
    4. Every N:th message, a personalized advertisement is also included in the reply.
    5. Reply is sent to the user with LINE API.
6. User receives the reply. (4 - 6 is repeated as long as user deletes the conversation)
7. User unfollows the bot, [Unfollow event](#events) sent to the bot:
    1. Server receives request for all user data deletion.
    2. Mark user data for deletion. See [Data deletion](#data-deletion) for more information.

<br>

### Group chats

When user adds the bot to group chat.

<br>

#### Group bot workflow

1. User invites the bot to a group.
2. [Join event](#events) send by LINE webhook to server:
    1. Check if group id exists in the database, if not create new group in group table.
    2. If group exists and is previously marked for deletion, set deletion to `false`.
3. Chat window opens, bot will send welcome message, including link to privacy policy and ToS. Users in group agree to terms if they post anything to the chat, otherwise bot must be removed from the group.
4. User sends a [Message event](#events) to the group chat.
5. Message is relayed to the bot server where:
    1. Message is stored in the database (group table) with group id as the key.
    * If message starts with the keyword `bot`:
        1. Message is sent to the OpenAI via API.
        2. Response is received from OpenAI API.
        3. Every N:th message, a personalized advertisement is also included in the reply.
        4. Reply is sent to the user with LINE API.
    * If message does not start with the keyword `bot`:
        1. Do nothing. (This way bot is called only then users want)
6. Group receives the reply. (4 - 6 is repeated as long as user removes the bot from the group)
7. If new user joins the group, [Member join event](#events) is sent to the bot server:
    1. Bot will send welcome message, including link to privacy policy and ToS. (This can be problematic if big channel as LINE counts each receiver in the chat as separate message).
8. User removes the bot from group, [Leave event](#events) sent to the bot server:
    1. Server receives request for all group data deletion.
    2. Mark group data for deletion. See [Data deletion](#data-deletion) for more information.

<br>

### Data deletion

Cron job checks every hour user/group deletion request older than 24 hours and deletes all data related to that user id.

<br>
