import mongoose, { Schema, Document } from 'mongoose';

/*
Logs for Messaging API request:

LINE recommends saving logs for Messaging API request and webhooks received for
a certain period of time so that developers themselves can smoothly investigate
the cause and scope of a problem when it occurs.

  - Request ID (x-line-request-id) of the Response header
  - Time of API request
  - Request method
  - API endpoint
  - Status code returned in response by the LINE Platform


Logs for webhooks received:

LINE recommends saving the following information as a log when you
receive a webhook from the LINE Platform through the bot server.

  - IP address of the webhook sender
  - Time webhook was received
  - Request method
  - Request path
  - Status code the bot server returned in response to the received webhook

203.0.113.1	Mon, 05 Jul 2021 08:10:00 GMT	POST	/linebot/webhook	200
*/

export interface ILog extends Document {
  _id: string;
  requestMethod: string;
  apiEndpointUrl: string;
  statusCode: number;
}

export const LogSchema: Schema = new Schema<ILog>({
  _id: { type: String, required: true  },
  requestMethod: { type: String, required: true  },
  apiEndpointUrl: { type: String, required: true  },
  statusCode: { type: Number, required: true },
}, { timestamps: { createdAt: true, updatedAt: false } });

export default mongoose.model<ILog>('Log', LogSchema);
