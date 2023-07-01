import { createClient } from 'redis';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

const client = createClient({
  url: REDIS_URL,
});

client.connect().catch((err) => {
  console.error(err);
});

export default client;
