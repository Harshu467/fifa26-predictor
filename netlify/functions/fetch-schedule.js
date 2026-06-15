const fetch = require('node-fetch');

// Netlify Function: fetch-schedule
// Env vars used:
// LIVE_API_PROVIDER: 'api-football' or 'football-data'
// LIVE_API_KEY: provider API key
// UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN (optional) for caching

const CACHE_KEY = 'live:schedule';
const CACHE_TTL = 15; // seconds

async function getCache() {
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

async function setCache(obj) {
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
      // Example: fixtures endpoint for season 2026
      const url = `https://v3.football.api-sports.io/fixtures?season=2026`;
      const res = await fetch(url, { headers: { 'x-apisports-key': key } });
      return await res.json();
    }

    if (provider === 'football-data') {
      const url = `https://api.football-data.org/v4/matches`;
      const res = await fetch(url, { headers: { 'X-Auth-Token': key } });
      return await res.json();
    }

    return { error: 'Unknown provider' };
  } catch (e) {
    return { error: e.message };
  }
}

exports.handler = async function (event, context) {
  // Try cache first
  const cached = await getCache();
  if (cached) {
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ source: 'cache', data: cached })
    };
  }

  // Fetch from provider
  const data = await fetchFromProvider();
  // If provider returned error, surface it
  if (data && data.error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: data.error })
    };
  }

  // Set cache (best-effort)
  await setCache(data);

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ source: 'provider', data })
  };
};
