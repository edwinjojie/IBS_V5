// Content script - bridges web app with extension
console.log('AirOps Multi-Screen Extension: Content script loaded')

// Inject extension API into the web page
const script = document.createElement('script')
script.src = chrome.runtime.getURL('injected-script.js')
script.onload = function() {
  this.remove()
}
;(document.head || document.documentElement).appendChild(script)

// Listen for messages from injected script (web page)
window.addEventListener('message', async (event) => {
  // Only accept messages from same origin
  if (event.source !== window) return
  
  const message = event.data
  if (!message.type || !message.type.startsWith('AIROPS_EXTENSION_')) return

  console.log('Content script received:', message)

  try {
    // Forward message to background script
    const response = await chrome.runtime.sendMessage({
      type: message.type.replace('AIROPS_EXTENSION_', ''),
      ...message.payload
    })

    // Send response back to web page
    window.postMessage({
      type: message.type + '_RESPONSE',
      requestId: message.requestId,
      success: true,
      data: response
    }, '*')

  } catch (error) {
    console.error('Content script error:', error)
    
    // Send error back to web page
    window.postMessage({
      type: message.type + '_RESPONSE',
      requestId: message.requestId,
      success: false,
      error: error.message
    }, '*')
  }
})

// Notify web page that extension is ready
window.postMessage({
  type: 'AIROPS_EXTENSION_READY',
  extensionId: chrome.runtime.id
}, '*')

console.log('Content script initialized')
