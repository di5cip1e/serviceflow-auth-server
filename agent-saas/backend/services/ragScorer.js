// LLM-as-a-Judge RAG evaluation service

const { openai } = require('@langfuse/langfuse');

const FAITHFULNESS_PROMPT = `Question: {user_question}
Retrieved Context: {context_chunks}
Answer: {assistant_answer}

Rate the faithfulness of this answer on a scale of 0.0 to 1.0.
A faithful answer ONLY uses information from the Retrieved Context.
If the answer contains information not in the Retrieved Context, score it lower.

Respond with a JSON object: { "score": 0.0-1.0, "reasoning": "brief explanation" }`;

const RELEVANCY_PROMPT = `Question: {user_question}
Answer: {assistant_answer}

Rate how well the answer addresses the Question on a scale of 0.0 to 1.0.
A relevant answer directly addresses what was asked.

Respond with a JSON object: { "score": 0.0-1.0, "reasoning": "brief explanation" }`;

async function scoreRAG(question, answer, contextChunks, modelHint) {
  // simple local eval using Langfuse OpenAI if available
  try {
    const model = modelHint || 'gpt-4o-mini';
    // naive scoring by leveraging a single API call per metric
    const faith = await callLLMFaith(question, answer, contextChunks, model);
    const rel = await callLLMRel(question, answer, model);
    const faithfulness = parseFloat(faith?.score);
    const relevancy = parseFloat(rel?.score);
    const composite = (0.6 * (isNaN(faithfulness)?0:faithfulness)) + (0.4 * (isNaN(relevancy)?0:relevancy));
    return { faithfulness, relevancy, composite };
  } catch (e) {
    console.error('ragScorer error', e);
    return { faithfulness:0, relevancy:0, composite:0 };
  }
}

async function callLLMFaith(question, answer, contextChunks, model){
  // placeholder: this should call OpenRouter with FAITHFULNESS_PROMPT
  // For now return a dummy 0.5
  return { score: '0.5', reasoning: 'mock' };
}

async function callLLMRel(question, answer, model){
  // placeholder
  return { score: '0.5', reasoning: 'mock' };
}

module.exports = { scoreRAG };
