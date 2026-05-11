const { Pool } = require('pg');
const config = require('../config/rag');

const pool = new Pool({
  host: config.pg.host,
  port: config.pg.port,
  database: config.pg.database,
  user: config.pg.user,
  password: config.pg.password,
  max: 10,
});

async function insertDocument(agentId, userId, name, sourceType, sourceUrl = null, fileSize = null) {
  const result = await pool.query(
    `INSERT INTO documents (agent_id, user_id, name, source_type, source_url, file_size) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id, created_at`,
    [agentId, userId, name, sourceType, sourceUrl, fileSize]
  );
  return result.rows[0];
}

async function insertChunk(docId, content, embedding, chunkIndex) {
  await pool.query(
    `INSERT INTO chunks (doc_id, content, embedding, chunk_index) VALUES ($1,$2,$3,$4)`,
    [docId, content, JSON.stringify(embedding), chunkIndex]
  );
}

async function similaritySearch(queryEmbedding, agentId, topK = 5) {
  const result = await pool.query(`
    SELECT c.id, c.content, c.chunk_index, c.doc_id, d.name as doc_name,
           1 - (c.embedding <=> $1::vector) AS similarity
    FROM chunks c
    JOIN documents d ON d.id = c.doc_id
    WHERE d.agent_id = $2
    ORDER BY c.embedding <=> $1::vector
    LIMIT $3
  `, [JSON.stringify(queryEmbedding), agentId, topK]);
  return result.rows;
}

async function deleteDocument(docId) {
  await pool.query(`DELETE FROM documents WHERE id = $1`, [docId]);
}

async function listDocuments(agentId) {
  const result = await pool.query(
    `SELECT id, name, source_type, source_url, file_size, created_at,
            (SELECT COUNT(*) FROM chunks WHERE doc_id = documents.id) as chunk_count
     FROM documents WHERE agent_id = $1 ORDER BY created_at DESC`,
    [agentId]
  );
  return result.rows;
}

async function getChunksByDoc(docId) {
  return (await pool.query(
    `SELECT id, content, chunk_index, created_at FROM chunks WHERE doc_id = $1 ORDER BY chunk_index`,
    [docId]
  )).rows;
}

module.exports = { pool, insertDocument, insertChunk, similaritySearch, deleteDocument, listDocuments, getChunksByDoc };
