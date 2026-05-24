const config = require('../config/rag');
const { getSecret } = require('../bootstrap');

const EMBEDDING_PROVIDER = process.env.EMBEDDING_PROVIDER || 'openai';

function getEmbeddingConfig() {
  if (EMBEDDING_PROVIDER === 'openrouter') {
    return {
      url: 'https://openrouter.ai/api/v1/embeddings',
      apiKey: getSecret('OPENROUTER_API_KEY'),
      model: config.embedding.model || 'openai/text-embedding-3-small'
    };
  }
  return {
    url: 'https://api.openai.com/v1/embeddings',
    apiKey: getSecret('OPENAI_API_KEY') || getSecret('OPENROUTER_API_KEY'),
    model: config.embedding.model || 'text-embedding-3-small'
  };
}

async function getEmbedding(text) {
  const cfg = getEmbeddingConfig();
  if (!cfg.apiKey) throw new Error('No API key set for embeddings');

  const response = await fetch(cfg.url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${cfg.apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: cfg.model,
      input: text.slice(0, 8000),
      dimensions: config.embedding.dimensions
    })
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Embedding failed: ${response.status} ${err}`);
  }
  const data = await response.json();
  return data.data[0].embedding;
}

async function embedChunks(texts) {
  const cfg = getEmbeddingConfig();
  if (!cfg.apiKey) throw new Error('No API key set for embeddings');

  const response = await fetch(cfg.url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${cfg.apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: cfg.model,
      input: texts.slice(0, 100),
      dimensions: config.embedding.dimensions
    })
  });

  if (!response.ok) throw new Error(`Batch embedding failed: ${response.status}`);
  const data = await response.json();
  return data.data.map(d => d.embedding);
}

module.exports = { getEmbedding, embedChunks };
