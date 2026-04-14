console.log('RTRVR Red Agent Active on Page');
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'EXECUTE_ACTION') {
    executePhysicalAction(message.payload);
  }
});
async function executePhysicalAction(action) {
  const element = document.querySelector(action.selector);
  if (!element) return;
  element.scrollIntoView({ behavior: 'smooth', block: 'center' });
  await new Promise(r => setTimeout(r, 1000));
  if (action.action === 'click') {
    ['mousedown', 'mouseup', 'click'].forEach(name => {
      element.dispatchEvent(new MouseEvent(name, { bubbles: true, cancelable: true, view: window }));
    });
  } else if (action.action === 'type') {
    element.focus();
    for (const char of action.value) {
      element.value += char;
      element.dispatchEvent(new Event('input', { bubbles: true }));
      await new Promise(r => setTimeout(r, 100));
    }
  }
}
