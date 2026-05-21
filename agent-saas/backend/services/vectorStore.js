const db = require('../database');

async function insertDocument(agentId, name, sourceType = 'doc', sourceUrl = null, fileSize = null) {
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO rag_documents (agent_id, doc_name, doc_type, content, chunk_index) VALUES (?, ?, ?, ?, 0)`,
      [agentId, name, sourceType, ''],
      function(err) {
        if (err) return reject(err);
        resolve({ id: this.lastID, created_at: new Date().toISOString() });
      }
    );
  });
}

async function insertChunk(docId, content, embedding, chunkIndex) {
  return new Promise((resolve, reject) => {
    // Get agent_id from rag_documents
    db.get('SELECT agent_id FROM rag_documents WHERE id = ?', [docId], (err, row) => {
      if (err) return reject(err);
      const agentId = row ? row.agent_id : '';
      db.run(
        `INSERT INTO rag_embeddings (document_id, agent_id, chunk_text, embedding) VALUES (?, ?, ?, ?)`,
        [docId, agentId, content, JSON.stringify(embedding)],
        function(err) {
          if (err) return reject(err);
          resolve({ id: this.lastID });
        }
      );
    });
  });
}

// Cosine similarity between two vectors
function cosineSimilarity(a, b) {
  if (!a || !b || a.length !== b.length) return 0;
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}

async function similaritySearch(queryEmbedding, agentId, topK = 5) {
  return new Promise((resolve, reject) => {
    // Fetch all chunks for this agent, compute similarity in JS
    db.all(
      `SELECT re.id, re.chunk_text as content, re.embedding, re.document_id as doc_id, rd.doc_name
       FROM rag_embeddings re
       JOIN rag_documents rd ON rd.id = re.document_id
       WHERE re.agent_id = ?`,
      [agentId],
      (err, rows) => {
        if (err) return reject(err);
        if (!rows || rows.length === 0) return resolve([]);

        const scored = rows.map(row => {
          let embedding = [];
          try { embedding = JSON.parse(row.embedding); } catch {}
          return {
            id: row.id,
            content: row.content,
            doc_id: row.doc_id,
            doc_name: row.doc_name,
            similarity: cosineSimilarity(queryEmbedding, embedding)
          };
        });

        scored.sort((a, b) => b.similarity - a.similarity);
        resolve(scored.slice(0, topK));
      }
    );
  });
}

async function deleteDocument(docId) {
  return new Promise((resolve, reject) => {
    // Delete embeddings first (no FK cascade in SQLite without pragma)
    db.run('DELETE FROM rag_embeddings WHERE document_id = ?', [docId], (err) => {
      if (err) return reject(err);
      db.run('DELETE FROM rag_documents WHERE id = ?', [docId], (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
  });
}

async function listDocuments(agentId) {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT rd.id, rd.doc_name as name, rd.doc_type as source_type, '' as source_url, 0 as file_size, rd.created_at,
              (SELECT COUNT(*) FROM rag_embeddings WHERE document_id = rd.id) as chunk_count
       FROM rag_documents rd
       WHERE rd.agent_id = ? ORDER BY rd.created_at DESC`,
      [agentId],
      (err, rows) => {
        if (err) return reject(err);
        resolve(rows || []);
      }
    );
  });
}

async function getChunksByDoc(docId) {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT id, chunk_text as content, created_at FROM rag_embeddings WHERE document_id = ?`,
      [docId],
      (err, rows) => {
        if (err) return reject(err);
        resolve(rows || []);
      }
    );
  });
}

module.exports = { insertDocument, insertChunk, similaritySearch, deleteDocument, listDocuments, getChunksByDoc };
