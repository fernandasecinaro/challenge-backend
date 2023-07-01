import { SQSClient } from '@aws-sdk/client-sqs';

import * as dotenv from 'dotenv';
dotenv.config();
// Set the AWS Region.
const REGION = process.env.AWS_REGION; //e.g. "us-east-1"
const SQS_ENDPOINT = process.env.SQS_ENDPOINT;
// Create SQS service object.
const sqsClient = new SQSClient({ region: REGION, endpoint: SQS_ENDPOINT ?? '' });
export { sqsClient };
