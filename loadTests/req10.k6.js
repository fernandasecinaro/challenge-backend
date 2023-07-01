import http from 'k6/http';
import { check, sleep } from 'k6';

const apiKeys = [
  {
    apiKey: 'family-costs-3d83ac55-0e90-4f09-beed-ae5c4722fea7',
  },
];

export const options = {
  scenarios: {
    constant_request_rate: {
      executor: 'constant-arrival-rate',
      rate: 1200,
      timeUnit: '1m',
      duration: '10m',
      preAllocatedVUs: 200,
      maxVUs: 200,
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<300'], // 99% of requests must complete below 1.5s
  },
};

const BASE_URL = 'http://obl1backv4-env.eba-yss3gpwt.us-east-1.elasticbeanstalk.com/api/v1';
const ENDPOINT = 'categories/73/expenses';
const TAKE = 5;

export default () => {
  const API_KEY = apiKeys[0];
  const authHeaders = {
    headers: {
      'X-Api-Key': API_KEY,
    },
    query: {
      take: TAKE,
      skip: Math.floor(Math.random() * 100),
    },
  };

  const objects = http.get(`${BASE_URL}/${ENDPOINT}`, authHeaders).json();
  check(objects, {
    'retrieved ranking': (obj) => obj.message,
  });

  sleep(1);
};
