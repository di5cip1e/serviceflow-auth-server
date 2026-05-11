const config = require('../config/rag');

async function getEmbedding(text) {
  const apiKey = process.env.OPENAI_API_KEY || process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error('No API key set for embeddings');

  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: config.embedding.model,
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
  const apiKey = process.env.OPENAI_API_KEY || process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error('No API key set for embeddings');

  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: config.embedding.model,
      input: texts.slice(0, 100),
      dimensions: config.embedding.dimensions
    })
  });

  if (!response.ok) throw new Error(`Batch embedding failed: ${response.status}`);
  const data = await response.json();
  return data.data.map(d => d.embedding);
}

module.exports = { getEmbedding, embedChunks };
