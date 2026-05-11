const config = require('../config/rag');

function tokenize(text) {
  return text.trim().split(/\s+/);
}

function countTokens(text) {
  return Math.ceil(tokenize(text).length / 0.75);
}

function chunkText(text, options = {}) {
  const { chunkSize = config.embedding.chunkSize, chunkOverlap = config.embedding.chunkOverlap, maxChunks = config.embedding.maxChunksPerDoc } = options;
  const cleaned = text.replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
  if (!cleaned) return [];

  const paragraphs = cleaned.split(/\n\n+/).filter(p => p.trim().length > 20);
  const chunks = [];
  let currentChunk = '';
  let currentTokens = 0;

  for (const para of paragraphs) {
    const paraTokens = countTokens(para);
    if (paraTokens > chunkSize) {
      const sentences = para.match(/[^.!?]+[.!?]+/g) || [para];
      for (const sentence of sentences) {
        const sentTokens = countTokens(sentence);
        if (currentTokens + sentTokens > chunkSize && currentChunk) {
          chunks.push(currentChunk.trim());
          const words = currentChunk.split(/\s+/);
          let overlapText = '';
          let t = 0;
          for (let i = words.length - 1; i >= 0 && t < chunkOverlap; i--) {
            overlapText = words[i] + (overlapText ? ' ' : '') + overlapText;
            t++;
          }
          currentChunk = overlapText;
          currentTokens = countTokens(overlapText);
        }
        currentChunk += (currentChunk ? ' ' : '') + sentence;
        currentTokens += sentTokens;
      }
    } else if (currentTokens + paraTokens > chunkSize) {
      chunks.push(currentChunk.trim());
      currentChunk = para;
      currentTokens = paraTokens;
    } else {
      currentChunk += (currentChunk ? '\n\n' : '') + para;
      currentTokens += paraTokens;
    }
  }
  if (currentChunk.trim()) chunks.push(currentChunk.trim());
  return chunks.slice(0, maxChunks);
}

async function extractTextFromPDF(buffer) {
  try {
    const pdfParse = require('pdf-parse');
    const data = await pdfParse(buffer);
    return data.text;
  } catch (e) {
    const raw = buffer.toString('latin1');
    const matches = raw.match(/\(([^\)]+)\)/g);
    if (matches) {
      return matches.map(m => m.slice(1, -1)).join(' ').replace(/[^\x20-\x7E\n]/g, ' ').trim();
    }
    return '';
  }
}

module.exports = { chunkText, countTokens, extractTextFromPDF };
