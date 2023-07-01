import aws from 'aws-sdk';
import https from 'https';
import http from 'http';

import * as dotenv from 'dotenv';
dotenv.config();

// aws.config.update({
//   iam: {
//     accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
//   },
//   region: 'us-east-1',
//   httpOptions: {
//     agent: new https.Agent({
//       keepAlive: true
//     })
//   },
// });

console.log('SQS_URL', process.env.SQS_ENDPOINT);

export const sqs = new aws.SQS({
  endpoint: process.env.SQS_ENDPOINT,
  httpOptions: {
    agent: process.env.SQS_ENDPOINT
      ? new http.Agent({
          keepAlive: true,
        })
      : new https.Agent({
          keepAlive: true,
        }),
  },
});
