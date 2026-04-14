console.log("RTRVR Red Agent Active on Page");
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "EXECUTE_ACTION") {
    executePhysicalAction(message.payload);
  }
});
async function executePhysicalAction(action) {
  const element = document.querySelector(action.selector);
  if (!element) {
    console.warn("Red Agent: Target not found", action.selector);
    return;
  }
  element.scrollIntoView({ behavior: 'smooth', block: 'center' });
  await sleep(1000);
  if (action.action === "click") {
    simulateHumanClick(element);
  } else if (action.action === "type") {
    await simulateHumanTyping(element, action.value);
  }
}
function simulateHumanClick(el) {
  const events = ['mousedown', 'mouseup', 'click'];
  events.forEach(name => {
    el.dispatchEvent(new MouseEvent(name, {
      bubbles: true, cancelable: true, view: window, isTrusted: true
    }));
  });
}
async function simulateHumanTyping(el, text) {
  el.focus();
  for (const char of text) {
    el.value += char;
    el.dispatchEvent(new Event('input', { bubbles: true }));
    await sleep(50 + Math.random() * 100);
  }
}
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
function scanInteractions() {
  const elements = Array.from(document.querySelectorAll('button, input, a, [role="button"]'))
    .map(el => ({
      tag: el.tagName,
      text: (el.innerText || el.placeholder || el.value || "").slice(0, 50),
      selector: getBestSelector(el)
    })).filter(e => e.selector);
  return elements;
}
function getBestSelector(el) {
  if (el.id) return `#${el.id}`;
  if (el.name) return `[name="${el.name}"]`;
  if (el.className) return `.${el.className.split(' ').join('.')}`;
  return null;
}
