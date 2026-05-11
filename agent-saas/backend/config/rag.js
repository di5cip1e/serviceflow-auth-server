module.exports = {
  pg: {
    host: process.env.PGVECTOR_HOST || 'localhost',
    port: parseInt(process.env.PGVECTOR_PORT || '5433'),
    database: 'maikr_rag',
    user: 'maikr_rag',
    password: process.env.PGVECTOR_PASSWORD || 'CHANGE_ME_TO_SECURE_PASSWORD',
  },
  embedding: {
    model: 'text-embedding-3-small',
    dimensions: 1536,
    chunkSize: 500,
    chunkOverlap: 100,
    maxChunksPerDoc: 100,
  }
};
