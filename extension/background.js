chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "ANALYZE_PAGE") {
    handlePageAnalysis(request.payload, sender.tab.id);
  }
  return true;
});

async function handlePageAnalysis(pageData, tabId) {
  try {
    const keys = await chrome.storage.local.get(['geminiApiKey', 'mistralApiKey', 'groqApiKey', 'sambaNovaApiKey']);

    const prompt = `You are a Super Agent. Task: ${pageData.task}. 
    Current Page URL: ${pageData.url}. 
    Available Elements: ${JSON.stringify(pageData.elements)}.
    Return JSON only: {"action": "click|type|complete", "selector": "...", "value": "..."}`;

    const providers = [
      { name: 'Gemini', key: keys.geminiApiKey, call: (p, k) => callGemini(p, k) },
      { name: 'Mistral', key: keys.mistralApiKey, call: (p, k) => callMistral(p, k) },
      { name: 'Groq', key: keys.groqApiKey, call: (p, k) => callGroq(p, k) },
      { name: 'SambaNova', key: keys.sambaNovaApiKey, call: (p, k) => callSambaNova(p, k) },
    ];

    let decision = null;
    for (const provider of providers) {
      if (!provider.key) continue;
      try {
        console.log(`Trying ${provider.name}...`);
        decision = await provider.call(prompt, provider.key);
        console.log(`${provider.name} succeeded.`);
        break;
      } catch (err) {
        console.warn(`${provider.name} failed:`, err.message);
      }
    }

    if (!decision) {
      console.error("All LLM providers failed or no API keys configured.");
      return;
    }

    chrome.tabs.sendMessage(tabId, {
      type: "EXECUTE_ACTION",
      payload: decision
    });
  } catch (error) {
    console.error("Brain Error:", error);
  }
}

function extractJSON(text) {
  const match = text.match(/\{.*\}/s);
  if (!match) throw new Error("No JSON found in response");
  return JSON.parse(match[0]);
}

async function callGemini(query, apiKey) {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: query }] }] })
  });
  if (!response.ok) throw new Error(`Gemini HTTP ${response.status}`);
  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
  return extractJSON(text);
}

async function callMistral(query, apiKey) {
  const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: 'mistral-small-latest',
      messages: [{ role: 'user', content: query }]
    })
  });
  if (!response.ok) throw new Error(`Mistral HTTP ${response.status}`);
  const data = await response.json();
  const text = data.choices?.[0]?.message?.content || "{}";
  return extractJSON(text);
}

async function callGroq(query, apiKey) {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages: [{ role: 'user', content: query }]
    })
  });
  if (!response.ok) throw new Error(`Groq HTTP ${response.status}`);
  const data = await response.json();
  const text = data.choices?.[0]?.message?.content || "{}";
  return extractJSON(text);
}

async function callSambaNova(query, apiKey) {
  const response = await fetch('https://api.sambanova.ai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: 'Meta-Llama-3.1-8B-Instruct',
      messages: [{ role: 'user', content: query }]
    })
  });
  if (!response.ok) throw new Error(`SambaNova HTTP ${response.status}`);
  const data = await response.json();
  const text = data.choices?.[0]?.message?.content || "{}";
  return extractJSON(text);
}
