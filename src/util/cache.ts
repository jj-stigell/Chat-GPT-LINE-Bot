/* eslint-disable max-len */
import NodeCache, { Options } from 'node-cache';

// Caching options for the messaging webhook prompts.
const nodeCacheOptions: Options = {
  stdTTL: 3600 * 24, // The standard ttl as number in seconds for every generated cache element. 0 = unlimited
  checkperiod: 3600, // The period in seconds, as a number, used for the automatic delete check interval. 0 = no periodic check.
  useClones: false, //If true you'll get a copy of the cached variable. If false you'll save and get just the reference.
  deleteOnExpire: true, // If true the variable will be deleted. If false the variable will remain.
  maxKeys: -1 // A maximum amount of keys that can be stored in the cache. If a new item is set and the cache is full, an error is thrown and the key will not be saved in the cache. -1 disables the key limit.
};

type Populate = {
  ttl: number;
  key: string;
  value: string;
};

const data: Array<Populate> = [
  {
    ttl: 0,
    key: '今夜の献立教えて下さい。',
    value: `今夜の献立の提案は以下の通りです：
    1. 前菜：冷製トマトスープ
    2. サラダ：シーザーサラダ
    3. 主菜：鶏の照り焼き、ほうれん草とマッシュルームの炒め物、ごはん
    4. デザート：抹茶アイスクリーム
    
    上記の献立は、和食と洋食の要素を取り入れたバラエティ豊かなものになっています。もちろん、お好みや食材のアレルギーに応じて変更・調整していただいて構いません。お食事をお楽しみください！`
  },
  {
    ttl: 0,
    key: '野球の英訳して下さい。',
    value: '野球は英語で "baseball" と訳されます。'
  }
];

export const promptCache: NodeCache = new NodeCache(nodeCacheOptions);

/**
 * Populate the prompt cache with common questions.
 * TODO: fetch most common questions from data base and cache?
 */
export function populateCache(): void {
  data.map((value: Populate) => {
    promptCache.set(value.key, value.value, value.ttl);
  });
  console.log('Cache populated');
}
