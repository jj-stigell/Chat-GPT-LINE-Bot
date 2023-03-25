//import axios, { AxiosStatic } from 'axios';
/*
import supertest from 'supertest';
import * as line from '@line/bot-sdk';
import { app } from '../src';
import { Client } from '@line/bot-sdk';
import { textMessageEventUser } from './data';

jest.mock('@line/bot-sdk');
// eslint-disable-next-line @typescript-eslint/typedef
const mockLine = line as jest.Mocked<typeof line>;
const request: supertest.SuperTest<supertest.Test> = supertest(app);

const client: line.Client = new Client({
  channelAccessToken: 'token',
  channelSecret: 'secret'
});



describe('Test GET /api/', () => {

  it('should rnnnn', async () => {
    mockLine.client.replyMessage.mockResolvedValue({
      data: 'fsdfsdf'
    });
  });
});




// Set up the tests
describe('Line Bot SDK - Express app', () => {
  beforeEach(() => {
    // Clear the mock history before each test
    jest.clearAllMocks();
  });

  test('should handle LINE webhook events', async () => {
    // Define a sample webhook event

    const event: any = {
      replyToken: 'fakeReplyToken',
      type: 'message',
      message: {
        id: '12345',
        type: 'text',
        text: 'Hello, world',
      },
    };


    // Make a POST request to the webhook
    const response: supertest.Response = await request
      .post('/webhook')
      .send({ events: [textMessageEventUser] });

    // Check if the status code is 200
    expect(response.status).toBe(200);

    // Check if the LINE client received the correct message
    expect(client.replyMessage).toHaveBeenCalledWith(
      textMessageEventUser.replyToken,
      expect.objectContaining({
        type: 'text',
        text: expect.any(String),
      }),
    );
  });

  // Add more tests if needed
});

*/