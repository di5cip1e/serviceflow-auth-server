// LLM-as-a-Judge RAG evaluation service
// Uses OpenRouter for faithfulness and relevancy scoring

const { getSecret } = require('../bootstrap');

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

async function callLLM(prompt, model) {
  const apiKey = getSecret('OPENROUTER_API_KEY');
  if (!apiKey) throw new Error('No OpenRouter API key');

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': 'http://maikr.pro',
      'X-Title': 'M.ai.K.R',
    },
    body: JSON.stringify({
      model: model || 'openrouter/openai/gpt-4.1-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 200,
      temperature: 0
    })
  });

  if (!response.ok) throw new Error(`LLM call failed: ${response.status}`);
  const data = await response.json();
  return data.choices[0].message.content;
}

async function callLLMFaith(question, answer, contextChunks, model) {
  const context = contextChunks.map((c, i) => `[${i + 1}] ${c.content || c}`).join('\n\n');
  const prompt = FAITHFULNESS_PROMPT
    .replace('{user_question}', question)
    .replace('{context_chunks}', context)
    .replace('{assistant_answer}', answer);

  const raw = await callLLM(prompt, model);
  try {
    const parsed = JSON.parse(raw.match(/\{[\s\S]*\}/)?.[0] || raw);
    return { score: String(parsed.score), reasoning: parsed.reasoning || '' };
  } catch {
    return { score: '0.5', reasoning: 'parse_failed' };
  }
}

async function callLLMRel(question, answer, model) {
  const prompt = RELEVANCY_PROMPT
    .replace('{user_question}', question)
    .replace('{assistant_answer}', answer);

  const raw = await callLLM(prompt, model);
  try {
    const parsed = JSON.parse(raw.match(/\{[\s\S]*\}/)?.[0] || raw);
    return { score: String(parsed.score), reasoning: parsed.reasoning || '' };
  } catch {
    return { score: '0.5', reasoning: 'parse_failed' };
  }
}

async function scoreRAG(question, answer, contextChunks, modelHint) {
  try {
    const model = modelHint || 'openrouter/openai/gpt-4.1-mini';
    const faith = await callLLMFaith(question, answer, contextChunks, model);
    const rel = await callLLMRel(question, answer, model);
    const faithfulness = parseFloat(faith?.score);
    const relevancy = parseFloat(rel?.score);
    const composite = (0.6 * (isNaN(faithfulness) ? 0 : faithfulness)) + (0.4 * (isNaN(relevancy) ? 0 : relevancy));
    return { faithfulness, relevancy, composite };
  } catch (e) {
    console.error('[ragScorer] error:', e.message);
    return { faithfulness: 0, relevancy: 0, composite: 0 };
  }
}

module.exports = { scoreRAG };
