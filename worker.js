// Cloudflare Worker — grok-video proxy
// Deploy: wrangler deploy

const XAI_BASE = "https://api.x.ai";
const ALLOWED_ORIGINS = ["*"];

function corsHeaders(origin) {
  return {
    "Access-Control-Allow-Origin": origin || "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}

async function handleOptions(request) {
  return new Response(null, {
    status: 204,
    headers: corsHeaders(request.headers.get("Origin")),
  });
}

async function proxyRequest(request, env) {
  const url = new URL(request.url);
  const path = url.pathname;

  // API key from environment variable or request header
  const authHeader = request.headers.get("Authorization");
  const apiKey = authHeader?.replace("Bearer ", "") || env.XAI_API_KEY;

  if (!apiKey) {
    return new Response(JSON.stringify({ error: "Missing API key" }), {
      status: 401,
      headers: { "Content-Type": "application/json", ...corsHeaders("*") },
    });
  }

  // Route mapping: our path → xAI path
  let xaiPath = path;
  // Compat: /v1/video/generations → /v1/videos/generations
  if (path === "/v1/video/generations") xaiPath = "/v1/videos/generations";
  // GET status: /v1/video/{id} → /v1/videos/{id}
  if (path.startsWith("/v1/video/") && path !== "/v1/video/generations") {
    xaiPath = "/v1/videos/" + path.split("/v1/video/")[1];
  }

  const targetUrl = `${XAI_BASE}${xaiPath}${url.search}`;

  let body = null;
  if (request.method === "POST") {
    const rawBody = await request.json().catch(() => ({}));
    // Normalize model name
    if (rawBody.model === "grok-video-normal") rawBody.model = "grok-imagine-video";
    // Normalize params
    if (rawBody.aspectRatio && !rawBody.aspect_ratio) {
      rawBody.aspect_ratio = rawBody.aspectRatio;
      delete rawBody.aspectRatio;
    }
    if (rawBody.quality && !rawBody.resolution) {
      rawBody.resolution = rawBody.quality;
      delete rawBody.quality;
    }
    body = JSON.stringify(rawBody);
  }

  const upstreamRes = await fetch(targetUrl, {
    method: request.method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body,
  });

  const resBody = await upstreamRes.text();
  const origin = request.headers.get("Origin") || "*";

  return new Response(resBody, {
    status: upstreamRes.status,
    headers: {
      "Content-Type": upstreamRes.headers.get("Content-Type") || "application/json",
      ...corsHeaders(origin),
    },
  });
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") return handleOptions(request);
    return proxyRequest(request, env);
  },
};
