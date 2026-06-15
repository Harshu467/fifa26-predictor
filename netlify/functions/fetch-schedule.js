const fetch = require('node-fetch');

// Netlify Function: fetch-schedule
// Env vars used:
// LIVE_API_PROVIDER: 'api-football' or 'football-data'
// LIVE_API_KEY: provider API key
// UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN (optional) for caching

const CACHE_KEY = 'live:schedule';
const CACHE_TTL = 15; // seconds
const RATE_LIMIT_WINDOW = 60; // seconds
const MAX_REQUESTS_PER_WINDOW = 20;

const localCache = { data: null, ts: 0 };
const requestLog = [];

function isRateLimited() {
  const now = Date.now() / 1000;
  while (requestLog.length > 0 && requestLog[0] < now - RATE_LIMIT_WINDOW) {
    requestLog.shift();
  }
  if (requestLog.length >= MAX_REQUESTS_PER_WINDOW) {
    return true;
  }
  requestLog.push(now);
  return false;
}

async function getRedisCache() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  try {
    const res = await fetch(`${url}/get/${encodeURIComponent(CACHE_KEY)}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) return null;
    const text = await res.text();
    if (!text) return null;
    return JSON.parse(text);
  } catch (e) {
    return null;
  }
}

async function setRedisCache(obj) {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return false;

  try {
    const body = JSON.stringify({
      key: CACHE_KEY,
      value: JSON.stringify(obj),
      ex: CACHE_TTL
    });
    const res = await fetch(`${url}/set`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body
    });
    return res.ok;
  } catch (e) {
    return false;
  }
}

async function fetchFromProvider() {
  const provider = process.env.LIVE_API_PROVIDER;
  const key = process.env.LIVE_API_KEY;
  if (!provider || !key) {
    return { error: 'No LIVE_API_PROVIDER or LIVE_API_KEY configured' };
  }

  try {
    if (provider === 'api-football') {
      const url = `https://v3.football.api-sports.io/fixtures?season=2026&league=1`;
      const res = await fetch(url, { headers: { 'x-apisports-key': key } });
      if (!res.ok) return { error: `API error: ${res.status}` };
      return await res.json();
    }

    if (provider === 'football-data') {
      const url = `https://api.football-data.org/v4/matches`;
      const res = await fetch(url, { headers: { 'X-Auth-Token': key } });
      if (!res.ok) return { error: `API error: ${res.status}` };
      return await res.json();
    }

    return { error: 'Unknown provider' };
  } catch (e) {
    return { error: e.message };
  }
}

exports.handler = async function (event, context) {
  // Check rate limit
  if (isRateLimited()) {
    console.warn('Rate limit exceeded');
    return {
      statusCode: 429,
      body: JSON.stringify({ error: 'Too many requests' })
    };
  }

  // Try Redis cache first
  const cached = await getRedisCache();
  if (cached) {
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ source: 'redis-cache', data: cached })
    };
  }

  // Try local memory cache
  const now = Date.now();
  if (localCache.data && now - localCache.ts < CACHE_TTL * 1000) {
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ source: 'memory-cache', data: localCache.data })
    };
  }

  // Fetch from provider
  const data = await fetchFromProvider();
  if (data && data.error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: data.error })
    };
  }

  // Cache the result
  localCache.data = data;
  localCache.ts = now;
  await setRedisCache(data); // best-effort

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ source: 'provider', data })
  };
};
