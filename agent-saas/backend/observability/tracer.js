/**
 * M.ai.K.R Observability Tracer
 * Uses @langfuse/tracing v5 (OpenTelemetry-based) + @langfuse/client
 *
 * Setup: Langfuse SDK v5 uses OTel spans that export to a Langfuse OTLP endpoint.
 * Environment variables:
 *   LANGFUSE_PUBLIC_KEY, LANGFUSE_SECRET_KEY — Langfuse API credentials
 *   LANGFUSE_BASE_URL — Langfuse server (defaults to http://localhost:3000)
 *   OTEL_EXPORTER_OTLP_ENDPOINT — OTLP collector endpoint (optional)
 *
 * If LANGFUSE_* vars not configured, falls back to no-op tracing.
 */
const { AsyncLocalStorage } = require('async_hooks');

// ── Check if Langfuse is configured ────────────────────────────────────────
const LANGFUSEConfigured =
  process.env.LANGFUSE_PUBLIC_KEY &&
  process.env.LANGFUSE_PUBLIC_KEY !== 'your_public_key';

// ── Langfuse v5 imports (lazy, only if configured) ───────────────────────────
let LangfuseClient = null;
let langfuseClient = null;
let startActiveSpan = null;
let tracingExports = {};

if (LANGFUSEConfigured) {
  try {
    const { LangfuseClient: LC } = require('@langfuse/client');
    const tracing = require('@langfuse/tracing');
    LangfuseClient = LC;
    startActiveSpan = tracing.startActiveSpan.bind(tracing);
    tracingExports = tracing;
  } catch (e) {
    console.warn('[OBSERVE] Langfuse packages not available, using console tracing:', e.message);
  }
}

// ── AsyncLocalStorage for trace context propagation ──────────────────────────
// This allows spans created in deeply nested async calls (like the tool-call loop
// in swarm.js) to automatically inherit the parent trace ID.
const traceStorage = new AsyncLocalStorage();

// ── Simple UUID generator ─────────────────────────────────────────────────────
function uuid() {
  return require('crypto').randomUUID();
}

// ── In-memory trace store (always active, no Langfuse required) ───────────────
// Key: traceId → { traceId, agentId, sessionId, intent, spans: [], startedAt }
const traceStore = new Map();

// ── Start a root trace ────────────────────────────────────────────────────────
// Returns a traceHandle that should be passed to endTrace()
function startTrace(traceName, metadata = {}) {
  const traceId = uuid();
  const now = new Date().toISOString();

  const trace = {
    traceId,
    name: traceName,
    agentId: metadata.agentId || null,
    sessionId: metadata.sessionId || null,
    intent: metadata.intent || null,
    spans: [],
    generations: [],
    scores: [],
    startedAt: now,
    completedAt: null,
    totalLatencyMs: null,
    overallScore: null,
    metadata,
  };

  traceStore.set(traceId, trace);

  // Wrap everything in AsyncLocalStorage so child async calls inherit context
  const store = { traceId, trace };
  const handle = {
    traceId,
    trace,
    storage: store,
    end: (overallScore) => {
      trace.completedAt = new Date().toISOString();
      trace.totalLatencyMs = new Date(trace.completedAt) - new Date(trace.startedAt);
      trace.overallScore = overallScore || null;
    },
    // Start a named span within this trace
    startSpan: (spanName, spanMetadata = {}) => {
      return startSpan(traceId, spanName, spanMetadata);
    },
    // Record an LLM generation within this trace
    recordGeneration: (genData) => {
      const gen = {
        id: uuid(),
        traceId,
        ...genData,
        createdAt: new Date().toISOString(),
      };
      trace.generations.push(gen);
      return gen;
    },
  };

  return handle;
}

// ── Start a child span ────────────────────────────────────────────────────────
// Can be called from any async context — AsyncLocalStorage propagates traceId
function startSpan(parentTraceId, spanName, spanMetadata = {}) {
  const parentTrace = traceStore.get(parentTraceId);
  const parentSpan = parentTrace?.spans[parentTrace.spans.length - 1] || null;

  const spanId = uuid();
  const now = new Date().toISOString();

  const span = {
    id: spanId,
    traceId: parentTraceId,
    name: spanName,
    parentSpanId: parentSpan?.id || null,
    attributes: spanMetadata,
    startedAt: now,
    completedAt: null,
    latencyMs: null,
    status: 'ok',
    generations: [],
  };

  if (parentTrace) {
    parentTrace.spans.push(span);
  }

  return {
    id: spanId,
    traceId: parentTraceId,
    name: spanName,
    end: (status = 'ok') => {
      span.completedAt = new Date().toISOString();
      span.latencyMs = new Date(span.completedAt) - new Date(span.startedAt);
      span.status = status;
    },
    // Record a generation within this span
    recordGeneration: (genData) => {
      const gen = {
        id: uuid(),
        traceId: parentTraceId,
        spanId,
        ...genData,
        createdAt: new Date().toISOString(),
      };
      span.generations.push(gen);
      if (parentTrace) {
        parentTrace.generations.push(gen);
      }
      return gen;
    },
  };
}

// ── Get active trace ID from AsyncLocalStorage ───────────────────────────────
function getCurrentTraceId() {
  const store = traceStorage.getStore();
  return store?.traceId || null;
}

// ── Wrap an async function with trace context ───────────────────────────────
// Usage: const result = await withTrace('My Operation', { traceId, agentId }, async () => { ... })
async function withTrace(name, metadata, fn) {
  const trace = startTrace(name, metadata);
  return traceStorage.run(
    { traceId: trace.traceId, trace },
    async () => {
      try {
        return await fn();
      } finally {
        trace.end();
      }
    }
  );
}

// ── Get traces from the store ─────────────────────────────────────────────────
function getTrace(traceId) {
  return traceStore.get(traceId) || null;
}

function getRecentTraces(agentId, limit = 50) {
  const traces = [];
  for (const trace of traceStore.values()) {
    if (!agentId || trace.agentId === agentId) {
      traces.push(trace);
    }
  }
  return traces
    .sort((a, b) => new Date(b.startedAt) - new Date(a.startedAt))
    .slice(0, limit);
}

// ── Score a RAG response using LLM-as-a-Judge ─────────────────────────────────
async function scoreRAG(question, answer, contextChunks, model = 'openrouter/openai/gpt-4o-mini') {
  const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
  if (!OPENROUTER_API_KEY) return { faithfulness: null, relevancy: null, composite: null };

  const contextStr = contextChunks.map((c, i) => `[${i + 1}] ${c.content}`).join('\n\n');

  const faithfulnessPrompt = `Question: ${question}
Retrieved Context:
${contextStr}

Answer: ${answer}

Rate the faithfulness of this answer on a scale of 0.0 to 1.0.
A faithful answer ONLY uses information from the Retrieved Context above.
If the answer contains information not found in the Retrieved Context, score it lower.
Respond with ONLY a JSON object: { "score": 0.0-1.0, "reasoning": "brief explanation" }`;

  const relevancyPrompt = `Question: ${question}
Answer: ${answer}

Rate how well the answer addresses what was asked on a scale of 0.0 to 1.0.
A relevant answer directly and comprehensively addresses the Question.
Respond with ONLY a JSON object: { "score": 0.0-1.0, "reasoning": "brief explanation" }`;

  async function getScore(prompt) {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'HTTP-Referer': 'http://maikr.pro',
          'X-Title': 'M.ai.K.R',
        },
        body: JSON.stringify({
          model: model.replace('openrouter/', ''),
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 200,
          temperature: 0.1,
        }),
      });
      const data = await response.json();
      if (data.error) return null;
      const text = data.choices[0].message.content.trim();
      // Extract JSON from response (might have backticks)
      const jsonMatch = text.match(/\{[\s\S]*?\}/);
      if (jsonMatch) return JSON.parse(jsonMatch[0]);
      return null;
    } catch {
      return null;
    }
  }

  const [faithResult, relResult] = await Promise.all([
    getScore(faithfulnessPrompt),
    getScore(relevancyPrompt),
  ]);

  const faithfulness = faithResult?.score ?? null;
  const relevancy = relResult?.score ?? null;
  const composite =
    faithfulness !== null && relevancy !== null
      ? 0.6 * faithfulness + 0.4 * relevancy
      : null;

  return { faithfulness, relevancy, composite };
}

module.exports = {
  startTrace,
  startSpan,
  withTrace,
  getCurrentTraceId,
  getTrace,
  getRecentTraces,
  traceStorage,     // exported for use in swarm.js with AsyncLocalStorage.run()
  scoreRAG,
  LANGFUSEConfigured,
};
