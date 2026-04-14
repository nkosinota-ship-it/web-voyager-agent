chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'ANALYZE_PAGE') {
    handlePageAnalysis(request.payload, sender.tab.id);
  }
  return true; 
});
async function handlePageAnalysis(pageData, tabId) {
  const prompt = 'Analyze Task: ' + pageData.task + ' on ' + pageData.url;
  // Decision logic and API call would go here
  chrome.tabs.sendMessage(tabId, { type: 'EXECUTE_ACTION', payload: { action: 'click', selector: 'button' } });
}
