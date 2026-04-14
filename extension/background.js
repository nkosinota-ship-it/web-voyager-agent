chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "ANALYZE_PAGE") {
    handlePageAnalysis(request.payload, sender.tab.id);
  }
  return true; 
});

async function handlePageAnalysis(pageData, tabId) {
  try {
    const { geminiApiKey } = await chrome.storage.local.get('geminiApiKey');
    if (!geminiApiKey) {
      console.error("No Gemini API key configured.");
      return;
    }

    const prompt = `You are a Super Agent. Task: ${pageData.task}. 
    Current Page URL: ${pageData.url}. 
    Available Elements: ${JSON.stringify(pageData.elements)}.
    Return JSON only: {"action": "click|type|complete", "selector": "...", "value": "..."}`;

    const decision = await callLLM(prompt, geminiApiKey);
    chrome.tabs.sendMessage(tabId, {
      type: "EXECUTE_ACTION",
      payload: decision
    });
  } catch (error) {
    console.error("Brain Error:", error);
  }
}

async function callLLM(query, apiKey) {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: query }] }] })
  });
  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
  return JSON.parse(text.match(/\{.*\}/s)[0]);
}
