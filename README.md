# LINE AI Bot server

## Table of Contents
  * [DISCLAIMER](#disclaimer)
  * [Introduction](#introduction)
  * [Deploying and using AI bot](#deploying-and-using-ai-bot)
  * [LINE](#line)
    * [Webhook events](#webhook-events)
    * [Webhook redelivery option](#webhook-redelivery-option)
  * [Bot functionality](#bot-functionality)
    * [1-on-1 chats](#1-on-1-chats)
      * [User bot workflow](#user-bot-workflow)
    * [Group chats](#group-chats)
      * [Group bot workflow](#group-bot-workflow)
    * [Data deletion](#data-deletion)
  * [Tech Stack](#tech-stack)


## DISCLAIMER

This document and the associated open-source software (OSS) are provided "as is" without
any express or implied warranties, including, but not limited to, any implied warranties
of merchantability or fitness for a particular purpose. The developer who published this
OSS shall not be held liable for any damages, direct or indirect, arising from the use,
testing, or deployment of this bot.

The primary intent of this software is for educational purposes, allowing users to learn
and understand the concepts and techniques involved in creating and deploying an AI bot
on the LINE platform. While it can be adapted for real-world applications, users should
exercise caution and ensure compliance with all applicable laws and regulations,
especially those governing data protection and privacy.

By forking, deploying, or otherwise using this OSS, you acknowledge and agree that all
data collection, storage, and processing activities are solely your responsibility.
The original repository owner assumes no responsibility or liability for any data
handling or privacy practices you undertake when utilizing this software.

It is your obligation to comply with all applicable laws and regulations, including
those governing data protection and privacy. You are solely responsible for ensuring
that your use of this software complies with all legal requirements and best practices
in your jurisdiction.

By using this software, you agree to indemnify and hold harmless the original repository
owner from any and all claims, damages, losses, or liabilities arising from your actions,
including but not limited to, the use, deployment, or testing of this bot.

## Introduction

This documentation aims to provide you with the necessary information to create and
deploy your own LINE AI bot. The bot can be used in 1-on-1 chats and group chats,
offering users the ability to communicate with the AI and receive responses based on the messages they send.

In this guide, you will learn how to set up your LINE bot account, handle webhook events, and implement
the bot functionality for both individual and group chats. We'll also walk you through the process of
data deletion and cover the tools required to build and deploy your bot.

## Deploying and using AI bot

To deploy and use your LINE AI bot, follow these steps:

1. Set up a LINE bot account, more info [here](https://developers.line.biz/en/docs/messaging-api/getting-started/#using-console).
[jp](https://developers.line.biz/ja/docs/messaging-api/getting-started/#using-console).
2. Copy the `LINE_CHANNEL_SECRET` and `LINE_CHANNEL_ACCESS_TOKEN` tokens to the project .env file. Example file is named `.env.example`.
3. Get your from [OpenAI](https://platform.openai.com/account/api-keys) API-keys `OPENAI_API_KEY` and `OPENAI_ORGANIZATION` (optional)
4. Set up MongoDB URI to `MONGODB_URI` env.
5. Deploy using Docker with command `$ Docker compose......`

After completing these steps, your AI bot is ready to be used in the LINE platform.
Connect with your bot and it should reply with welcoming message is ready to be used.

## LINE

## Webhook events

Following list is a copy from [LINE documentation](https://developers.line.biz/en/docs/messaging-api/receiving-messages/#webhook-event-types) for webhook events.
Added extra column lists which events are currently supported by this AI Bot.

| Event type | Description | 1-on-1 chats | Group chats and multi-person chats | Currently supported by this AI Bot |
|------------|-------------|--------------|------------------------------------|------------------------------------|
| [Message event](https://developers.line.biz/en/reference/messaging-api/#message-event) | Indicates that the user sent a message. You can reply to this event.                                                |      ✅      |                 ✅                |   ✅  |
| [Unsend event](https://developers.line.biz/en/reference/messaging-api/#unsend-event) | Indicates that the user unsent a message.                                                                            |      ✅      |                 ✅                |   ❌  |
| [Follow event](https://developers.line.biz/en/reference/messaging-api/#follow-event) | Indicates that your LINE Official Account was added as a friend (or unblocked). You can reply to this event.         |      ✅      |                 ❌                |   ✅  |
| [Unfollow event](https://developers.line.biz/en/reference/messaging-api/#unfollow-event) | Indicates that your LINE Official Account was blocked.                                                               |      ✅      |                 ❌                |   ✅  |
| [Join event](https://developers.line.biz/en/reference/messaging-api/#join-event) | Indicates that your LINE Official Account joined a group chat or multi-person chat. You can reply to this event.   |      ❌      |                 ✅                |   ✅  |
| [Leave event](https://developers.line.biz/en/reference/messaging-api/#leave-event) | Indicates that the user either deleted your LINE Official Account from the group chat, or the LINE Official Account has left the group chat or multi-person chat. |      ❌      |                 ✅                |   ✅  |
| [Member join event](https://developers.line.biz/en/reference/messaging-api/#member-joined-event) | Indicates that the user joined a group chat or multi-person chat of which your LINE Official Account is a member. You can reply to this event. |      ❌      |                 ✅                |   ❌  |
| [Member leave event](https://developers.line.biz/en/reference/messaging-api/#member-left-event) | Indicates that the user left a group chat or multi-person chat of which your LINE Official Account is a member.      |      ❌      |                 ✅                |   ❌  |
| [Postback event](https://developers.line.biz/en/reference/messaging-api/#postback-event) | Indicates that the user performed a postback action. You can reply to this event.                                   |      ✅      |                 ✅                |   ❌  |
| [Video viewing complete event](https://developers.line.biz/en/reference/messaging-api/#video-viewing-complete) | Indicates that the user finished watching the video message with the specified trackingId sent from the LINE Official account. You can reply to this event. |      ✅      |                 ❌                |   ❌   |

## Bot functionality

Describes bot functionality in 1-on1 user and group chats.

### 1-on-1 chats

When user is chatting alone in private conversation with the bot.

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

### Group chats

When user adds the bot to a group chat.

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

### Data deletion

Cron job checks every hour user/group deletion request older than 24 hours and deletes all data related to that user or group id.

## Tech Stack

* [LINE SDK](https://github.com/line/line-bot-sdk-nodejs) - LINE Messaging API SDK for nodejs
* [Node-Cache](https://github.com/node-cache/node-cache) - Simple and fast NodeJS internal caching.
* [Express](https://github.com/expressjs/express) - Fast, unopinionated, minimalist web framework for Node.js.
* [Typescript](https://github.com/microsoft/TypeScript) - TypeScript is a superset of JavaScript that compiles to clean JavaScript output.
* [OpenAI-Node](https://github.com/openai/openai-node) - Node.js library for the OpenAI API
* [MongoDB](https://www.mongodb.com/) - MongoDB is a document-oriented NoSQL database program.
* [Mongoose](https://github.com/Automattic/mongoose) - MongoDB object modeling designed to work in an asynchronous environment.
