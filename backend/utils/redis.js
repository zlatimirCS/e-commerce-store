import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

console.log('UPSTASH_REDIS_URL', process.env.UPSTASH_REDIS_URL);

export const redis = new Redis(process.env.UPSTASH_REDIS_URL);
// await client.set('foo', 'bar');
