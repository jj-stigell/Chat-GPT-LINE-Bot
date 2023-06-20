**English instructions [here](#chatgtp-line-bot)**

# ChatGTP LINEボット

## 目次
  * [免責事項](#免責事項)
  * [はじめに](#はじめに)
  * [デプロイ](#デプロイ)
  * [ボット機能](#ボットの機能)
    * [1対1のチャット](#1対1のチャット)
      * [ユーザーボットのワークフロー](#ユーザーボットのワークフロー)
    * [グループチャット](#グループチャット)
      * [グループボットのワークフロー](#グループボットのワークフロー)
    * [データ削除](#データ削除)
  * [テックスタック](#テックスタック)

## 免責事項

本文書及び関連するオープンソースソフトウェア(OSS)は、一切の明示的または黙示的な保証を伴わず、「現状のまま」提供されます。
特定の目的への適合性に関する黙示的な保証を含むが、これに限定されません。本OSSを公開した開発者は、本ボットの使用、テスト、
デプロイから生じるいかなる直接的または間接的な損害に対しても責任を負いません。

このソフトウェアの主な目的は教育的なもので、ユーザーがLINEプラットフォーム上でAIボットを作成しデプロイする際の概念や
技術を学び理解することを可能にするものです。実世界のアプリケーションに適応可能ではありますが、ユーザーは注意を払い、
データ保護とプライバシーに関する法律や規制を含むすべての適用可能な法律と規制を遵守することを確認する必要があります。

本OSSをフォークし、デプロイするか、あるいはそれを利用することにより、すべてのデータ収集、保管、処理活動が完全にあなた
自身の責任であることを認識し同意するものとします。オリジナルのリポジトリオーナーは、このソフトウェアを
利用する際にあなたが取り組むデータハンドリングやプライバシー実践に対して一切の責任や責任を負わないものとします。

あなたはデータ保護やプライバシーを規制するすべての適用可能な法律や規制を遵守する義務があります。
あなたのソフトウェア利用があなたの管轄地域のすべての法律要件やベストプラクティスに適合していることを
確認する責任はあなたにあります。

このソフトウェアを使用することにより、あなたはこのボットの使用、デプロイ、テストを含む、
あなたの行動から生じる一切の請求、損害、損失、責任について、オリジナルのリポジトリオーナーを免責することに同意します。

## はじめに

このドキュメンテーションは、あなた自身のLINE ChatGTPボットを作成しデプロイするための必要な情報を提供することを目指しています。
現時点では、ボットは1対1のチャットで使用することができます。グループチャットはまだ実装されていません。

このガイドでは、LINEボットアカウントのセットアップ方法やwebhookイベントの取り扱い方を学びます。
また、データの削除の手順や、ボットを作成しデプロイするために必要なツールについても説明します。

<p align="center" style="margin-top: 20px; font-size: 30px;">
  LINE上でボットを試すためにスキャンしてください
  <br>
  <img src="./landing_page/img/qr-code.png" alt="QR-code-for-demo" width="20%" style="margin-bottom: 50px;" />
</p>

## デプロイ

あなたのLINE AIボットをデプロイし使用するためには、以下の手順を実行してください：

1. LINEの指示に従ってLINEボットアカウントを設定します。詳細は[こちら](https://developers.line.biz/ja/docs/messaging-api/getting-started/#using-console).
2. `LINE_CHANNEL_SECRET` と `LINE_CHANNEL_ACCESS_TOKEN` トークンをプロジェクトの .env ファイルにコピーします。例のファイル名は `.env.example` です。
3. [OpenAI](https://platform.openai.com/account/api-keys) からAPIキー `OPENAI_API_KEY`（必須）と `OPENAI_ORGANIZATION`（オプション）を取得します。
4. MongoDB URI を `MONGODB_URI` 環境変数に設定します。フリーティアのMongoDBは[こちら](https://www.mongodb.com/ja-jp/atlas/database)から利用できます。
5. オンライン（Heroku、Renderなど）にデプロイします。WebhookのアドレスをLINEに設定します。

これらの手順を完了した後、あなたのAIボットはLINEプラットフォームで使用する準備が整います。ボットに接続し、
ウェルカムメッセージが表示されると使用開始準備が整ったことになります。

## ボットの機能

1対1のユーザーチャットとグループチャットでのボットの機能について説明します。

**注意** 現在は1対1のチャットのみが実装されています。

### 1対1のチャット

ユーザーがボットとプライベートな会話で一人でチャットしている場合。

#### ユーザーボットのワークフロー

1. ユーザーはボットを友達として追加します。
2. LINE webhookからサーバーに送信される[Follow event](#events)：
    1. ユーザーIDがデータベースに存在するか確認し、存在しない場合は新規ユーザーを作成します。
    2. ユーザーが存在し、以前に削除マークが付けられていた場合は、削除を`false`に設定します。
3. チャットウィンドウが開き、ボットはプライバシーポリシーやToSへのリンクを含むウェルカムメッセージを送信します。
4. ユーザーがチャットに[Message event](#events)を送信します。
5. メッセージはボットサーバーに中継され、ここで：
    1. メッセージはユーザーIDをキーとしてデータベース（1対1テーブル）に保存されます。
    2. メッセージはAPIを介してOpenAIに送信されます。
    3. OpenAI APIから応答が受け取られます。
    4. LINE APIを使ってユーザーに応答が送信されます。
6. ユーザーが応答を受け取ります。（4 - 6は、ユーザーが会話を削除するまで繰り返されます）
7. ユーザーがボットをアンフォローし、[Unfollow event](#events)がボットに送信されます：
    1. サーバーは全てのユーザーデータ削除のリクエストを受け取ります。
    2. ユーザーデータを削除するためにマークします。詳細は[Data deletion](#data-deletion)をご覧ください。

### グループチャット

ユーザーがボットをグループチャットに追加した場合。

#### グループボットのワークフロー

1. ユーザーがボットをグループに招待します。
2. LINE webhookからサーバーに送信される[Join event](#events)：
    1. グループIDが

データベースに存在するか確認し、存在しない場合はgroup tableに新規グループを作成します。
    2. グループが存在し、以前に削除マークが付けられていた場合は、削除を`false`に設定します。
3. チャットウィンドウが開き、ボットはプライバシーポリシーやToSへのリンクを含むウェルカムメッセージを送信します。グループ内のユーザーは、何かをチャットに投稿する場合、利用規約に同意したことになります。それ以外の場合は、ボットをグループから削除しなければなりません。
4. ユーザーがグループチャットに[Message event](#events)を送信します。
5. メッセージはボットサーバーに中継され、ここで：
    1. メッセージはグループIDをキーとしてデータベース（group table）に保存されます。
    * メッセージがキーワード`bot`で始まる場合：
        1. メッセージはAPIを介してOpenAIに送信されます。
        2. OpenAI APIから応答が受け取られます。
        3. LINE APIを使ってユーザーに応答が送信されます。
    * メッセージがキーワード`bot`で始まらない場合：
        1. 何もしません。（この方法で、ボットはユーザーが必要とする場合のみ呼び出されます）
6. グループが応答を受け取ります。（4 - 6は、ユーザーがボットをグループから削除するまで繰り返されます）
7. 新しいユーザーがグループに参加すると、[Member join event](#events)がボットサーバーに送信されます：
    1. ボットはウェルカムメッセージを送信します。これにはプライバシーポリシーとToSへのリンクが含まれています。（これはLINEがチャット内の各受信者を別のメッセージとしてカウントするため、大きなチャネルでは問題になることがあります）。
8. ユーザーがボットをグループから削除し、[Leave event](#events)がボットサーバーに送信されます：
    1. サーバーは全てのグループデータ削除のリクエストを受け取ります。
    2. グループデータを削除するためにマークします。

詳細は[Data deletion](#data-deletion)をご覧ください。

### データ削除

ユーザーがボットをアンフォローすると、そのユーザーまたはグループIDに関連するすべてのデータが削除されます。

## テックスタック

* [LINE SDK](https://github.com/line/line-bot-sdk-nodejs) - LINE Messaging API SDK for nodejs
* [Node-Cache](https://github.com/node-cache/node-cache) - シンプルで高速なNodeJS内部キャッシング。
* [Express](https://github.com/expressjs/express) - 高速で無個性的、極度に簡素化された Node.js 用ウェブフレームワーク。
* [Typescript](https://github.com/microsoft/TypeScript) - TypeScriptは、クリーンなJavaScriptの出力にコンパイルするJavaScriptのスーパーセットです。
* [OpenAI-Node](https://github.com/openai/openai-node) - OpenAI API用のNode.jsライブラリ
* [MongoDB](https://www.mongodb.com/) - MongoDBはドキュメント指向のNoSQLデータベースプログラムです。
* [Mongoose](https://github.com/Automattic/mongoose) - MongoDBオブジェクトモデリングは非同期環境で動作するように設計されています。

<hr>

# ChatGTP LINE Bot

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
deploy your own LINE ChatGTP bot. The bot can be currently used in 1-on-1 chats, group chats are not implemented yet.

In this guide, you will learn how to set up your LINE bot account, handle webhook events.
We'll also walk you through the process of data deletion and cover the tools required to build and deploy your bot.

<p align="center" style="margin-top: 20px; font-size: 30px;">
  Scan to try the bot on LINE
  <br>
  <img src="./landing_page/img/qr-code.png" alt="QR-code-for-demo" width="20%" style="margin-bottom: 50px;" />
</p>

## Deploying and using AI bot

To deploy and use your LINE AI bot, follow these steps:

1. Set up a LINE bot account according to LINE instructions, more info [here](https://developers.line.biz/en/docs/messaging-api/getting-started/#using-console).
2. Copy the `LINE_CHANNEL_SECRET` and `LINE_CHANNEL_ACCESS_TOKEN` tokens to the project .env file. Example file is named `.env.example`.
3. Get your from [OpenAI](https://platform.openai.com/account/api-keys) API-keys `OPENAI_API_KEY` (required) and `OPENAI_ORGANIZATION` (optional)
4. Set up MongoDB URI to `MONGODB_URI` env. Freetier MongoDB available [here](https://www.mongodb.com/atlas/database)
5. Deploy to online (Heroku, Render, etc.). Set up the webhook address to LINE.

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

**NOTE** Currently only 1-on-1 chats are implemented.

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

When user unfollows the bot, all data related to that user or group id is deleted.

## Tech Stack

* [LINE SDK](https://github.com/line/line-bot-sdk-nodejs) - LINE Messaging API SDK for nodejs
* [Node-Cache](https://github.com/node-cache/node-cache) - Simple and fast NodeJS internal caching.
* [Express](https://github.com/expressjs/express) - Fast, unopinionated, minimalist web framework for Node.js.
* [Typescript](https://github.com/microsoft/TypeScript) - TypeScript is a superset of JavaScript that compiles to clean JavaScript output.
* [OpenAI-Node](https://github.com/openai/openai-node) - Node.js library for the OpenAI API
* [MongoDB](https://www.mongodb.com/) - MongoDB is a document-oriented NoSQL database program.
* [Mongoose](https://github.com/Automattic/mongoose) - MongoDB object modeling designed to work in an asynchronous environment.
