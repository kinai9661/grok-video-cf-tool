/**
 * Grok Video Generator — Cloudflare Worker
 * Proxies requests to xAI API with automatic format normalization
 * Set secret: XAI_API_KEY via `wrangler secret put XAI_API_KEY`
 */

const XAI_API_BASE = 'https://api.x.ai/v1';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    const apiKey = env.XAI_API_KEY;
    if (!apiKey) {
      return jsonResponse({ error: 'XAI_API_KEY not configured' }, 500);
    }

    try {
      // POST /generate — Text to Video
      if (path === '/generate' && request.method === 'POST') {
        const body = await request.json();
        const payload = normalizeGeneratePayload(body);
        const res = await callXAI('/videos/generations', 'POST', payload, apiKey);
        return jsonResponse(res.data, res.status);
      }

      // POST /generate-from-image — Image to Video
      if (path === '/generate-from-image' && request.method === 'POST') {
        const body = await request.json();
        const payload = normalizeImagePayload(body);
        const res = await callXAI('/videos/generations', 'POST', payload, apiKey);
        return jsonResponse(res.data, res.status);
      }

      // GET /status/:requestId — Poll status
      const statusMatch = path.match(/^\/status\/(.+)$/);
      if (statusMatch && request.method === 'GET') {
        const requestId = statusMatch[1];
        const res = await callXAI(`/videos/generations/${requestId}`, 'GET', null, apiKey);
        return jsonResponse(res.data, res.status);
      }

      // GET /health
      if (path === '/health') {
        return jsonResponse({ status: 'ok', timestamp: Date.now() });
      }

      return jsonResponse({ error: 'Not found' }, 404);

    } catch (err) {
      return jsonResponse({ error: err.message }, 500);
    }
  }
};

/** Normalize text-to-video payload to official xAI format */
function normalizeGeneratePayload(body) {
  return {
    model: body.model || 'grok-imagine-video',
    prompt: body.prompt,
    n: body.n || 1,
    ...(body.duration && { duration: body.duration }),
    ...(body.resolution && { resolution: body.resolution }),
    ...(body.aspect_ratio || body.aspectRatio ? { aspect_ratio: body.aspect_ratio || body.aspectRatio } : {}),
  };
}

/** Normalize image-to-video payload */
function normalizeImagePayload(body) {
  const payload = normalizeGeneratePayload(body);
  if (body.image) {
    payload.image = body.image; // base64 data URL or URL
  }
  return payload;
}

async function callXAI(endpoint, method, body, apiKey) {
  const url = `${XAI_API_BASE}${endpoint}`;
  const init = {
    method,
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
  };
  if (body) init.body = JSON.stringify(body);

  const res = await fetch(url, init);
  const data = await res.json().catch(() => ({ error: 'Invalid JSON response' }));
  return { status: res.status, data };
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });
}
