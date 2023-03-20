/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
//const crypto = require("crypto");

import * as crypto from 'crypto';

const channelSecret: string = '...'; // Channel secret string
const body: string = '...'; // Request body string
const signature: any = crypto
  .createHmac('SHA256', channelSecret)
  .update(body)
  .digest('base64');
// Compare x-line-signature request header and the signature
