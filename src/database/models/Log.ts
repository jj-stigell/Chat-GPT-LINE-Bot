import mongoose, { Schema, Document } from 'mongoose';

/*
LINE recommends saving logs for Messaging API request and webhooks received for
a certain period of time so that developers themselves can smoothly investigate
the cause and scope of a problem when it occurs.

* Request ID (x-line-request-id) of the Response header
* Time of API request
* Request method
* API endpoint
* Status code returned in response by the LINE Platform
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
