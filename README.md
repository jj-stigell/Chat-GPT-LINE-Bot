# LINE Bot server

## Table of Contents
  * 


Before enabling Webhook redelivery option
Caution: Before enabling the Webhook redelivery option, check the following points:

Due to network routing problems and other factors, duplicate webhook events may be sent. If this is an issue, use webhook event ID to detect duplicates.
If webhook events are redelivered, the order in which webhook events occur and the order in which they reach the bot server can be different significantly. If this is an issue, check the context by looking at the timestamp of webhook events.