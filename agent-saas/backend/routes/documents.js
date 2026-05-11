const express = require('express');
const router = express.Router();
const multer = require('multer');
const { insertDocument, insertChunk, deleteDocument, listDocuments } = require('../services/vectorStore');
const { chunkText, extractTextFromPDF } = require('../services/chunking');
const { getEmbedding, embedChunks } = require('../services/embeddingService');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// POST /api/documents/upload
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const { agentId, userId } = req.body;
    if (!agentId || !userId) return res.status(400).json({ error: 'agentId and userId required' });
    if (!req.file) return res.status(400).json({ error: 'No file provided' });

    let text = '';
    if (req.file.mimetype === 'application/pdf') {
      text = await extractTextFromPDF(req.file.buffer);
    } else {
      text = req.file.buffer.toString('utf8');
    }
    if (!text.trim()) return res.status(400).json({ error: 'Could not extract text from file' });

    const chunks = chunkText(text);
    const doc = await insertDocument(agentId, userId, req.file.originalname, 'doc', null, req.file.size);

    for (let i = 0; i < chunks.length; i += 20) {
      const batch = chunks.slice(i, i + 20);
      const embeddings = await embedChunks(batch);
      for (let j = 0; j < batch.length; j++) {
        await insertChunk(doc.id, batch[j], embeddings[j], i + j);
      }
    }
    res.json({ success: true, documentId: doc.id, chunkCount: chunks.length });
  } catch (err) {
    console.error('Document upload error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/documents/upload-url
router.post('/upload-url', async (req, res) => {
  try {
    const { agentId, userId, url, name } = req.body;
    if (!agentId || !userId || !url) return res.status(400).json({ error: 'agentId, userId, and url required' });

    const response = await fetch(url, { headers: { 'User-Agent': 'M.ai.K.R/1.0' } });
    if (!response.ok) return res.status(400).json({ error: `Failed to fetch URL: ${response.status}` });

    const contentType = response.headers.get('content-type') || '';
    let text = '';
    if (contentType.includes('text/html')) {
      const html = await response.text();
      text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 50000);
    } else {
      text = await response.text();
    }
    if (!text.trim()) return res.status(400).json({ error: 'No text content found at URL' });

    const chunks = chunkText(text);
    const docName = name || new URL(url).hostname;
    const doc = await insertDocument(agentId, userId, docName, 'url', url, text.length);

    for (let i = 0; i < chunks.length; i += 20) {
      const batch = chunks.slice(i, i + 20);
      const embeddings = await embedChunks(batch);
      for (let j = 0; j < batch.length; j++) {
        await insertChunk(doc.id, batch[j], embeddings[j], i + j);
      }
    }
    res.json({ success: true, documentId: doc.id, chunkCount: chunks.length });
  } catch (err) {
    console.error('URL embed error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/documents/upload-text
router.post('/upload-text', async (req, res) => {
  try {
    const { agentId, userId, name, content } = req.body;
    if (!agentId || !userId || !content) return res.status(400).json({ error: 'agentId, userId, and content required' });

    const chunks = chunkText(content);
    const doc = await insertDocument(agentId, userId, name || 'Pasted Text', 'text', null, content.length);

    for (let i = 0; i < chunks.length; i += 20) {
      const batch = chunks.slice(i, i + 20);
      const embeddings = await embedChunks(batch);
      for (let j = 0; j < batch.length; j++) {
        await insertChunk(doc.id, batch[j], embeddings[j], i + j);
      }
    }
    res.json({ success: true, documentId: doc.id, chunkCount: chunks.length });
  } catch (err) {
    console.error('Text upload error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/documents
router.get('/', async (req, res) => {
  try {
    const { agentId } = req.query;
    if (!agentId) return res.status(400).json({ error: 'agentId required' });
    res.json({ documents: await listDocuments(agentId) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/documents/:id
router.delete('/:id', async (req, res) => {
  try {
    await deleteDocument(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
