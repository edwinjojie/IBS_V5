// Background script for multi-screen window management
class MultiScreenManager {
  constructor() {
    this.screens = []
    this.screenRoles = new Map()
    this.init()
  }

  async init() {
    // Get display information with elevated permissions
    this.screens = await this.getDisplayInfo()
    console.log('Extension: Detected screens', this.screens)
  }

  async getDisplayInfo() {
    try {
      // Use Chrome's system.display API (requires permission)
      return new Promise((resolve) => {
        chrome.system.display.getInfo((displays) => {
          const screens = displays.map((display, index) => ({
            id: index,
            left: display.bounds.left,
            top: display.bounds.top,
            width: display.bounds.width,
            height: display.bounds.height,
            isPrimary: display.isPrimary
          }))
          resolve(screens)
        })
      })
    } catch (error) {
      console.error('Failed to get display info:', error)
      return []
    }
  }

  async createWindowOnScreen(url, screenId, options = {}) {
    const screen = this.screens.find(s => s.id === screenId)
    
    if (!screen) {
      console.error('Screen not found:', screenId)
      return null
    }

    // Calculate window position on target screen
    const windowWidth = options.width || Math.min(1200, screen.width * 0.8)
    const windowHeight = options.height || Math.min(800, screen.height * 0.8)
    const left = screen.left + (screen.width - windowWidth) / 2
    const top = screen.top + (screen.height - windowHeight) / 2

    try {
      // Use Chrome's windows API with elevated permissions
      const window = await chrome.windows.create({
        url: url,
        type: 'normal',
        left: Math.round(left),
        top: Math.round(top),
        width: Math.round(windowWidth),
        height: Math.round(windowHeight),
        focused: true
      })

      console.log(`Extension: Created window on screen ${screenId}:`, {
        expected: { left, top, width: windowWidth, height: windowHeight },
        actual: { left: window.left, top: window.top, width: window.width, height: window.height }
      })

      return window
    } catch (error) {
      console.error('Failed to create window on screen:', error)
      return null
    }
  }

  async assignScreenRole(screenId, role) {
    this.screenRoles.set(screenId, role)
    // Store in extension storage
    await chrome.storage.local.set({
      [`screen_role_${screenId}`]: role
    })
  }

  async getScreenRole(screenId) {
    // Try memory first
    if (this.screenRoles.has(screenId)) {
      return this.screenRoles.get(screenId)
    }
    
    // Try storage
    const result = await chrome.storage.local.get([`screen_role_${screenId}`])
    const role = result[`screen_role_${screenId}`] || null
    
    if (role) {
      this.screenRoles.set(screenId, role)
    }
    
    return role
  }

  async getDetailedScreen() {
    for (let [screenId, role] of this.screenRoles) {
      if (role === 'detailed') {
        return screenId
      }
    }
    
    // Fallback to second screen if available
    return this.screens.length > 1 ? 1 : 0
  }
}

// Initialize manager
const multiScreenManager = new MultiScreenManager()

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Extension: Received message', message)

  switch (message.type) {
    case 'GET_SCREENS':
      sendResponse({ screens: multiScreenManager.screens })
      break

    case 'ASSIGN_ROLE':
      multiScreenManager.assignScreenRole(message.screenId, message.role)
        .then(() => sendResponse({ success: true }))
        .catch(error => sendResponse({ success: false, error: error.message }))
      return true // Keep message channel open

    case 'POPUP_DETAILED_VIEW':
      handlePopupDetailedView(message)
        .then(result => sendResponse(result))
        .catch(error => sendResponse({ success: false, error: error.message }))
      return true

    case 'GET_SCREEN_ROLES':
      getScreenRoles()
        .then(roles => sendResponse({ roles }))
        .catch(error => sendResponse({ success: false, error: error.message }))
      return true
  }
})

async function handlePopupDetailedView(message) {
  const { type, id, options = {} } = message
  
  // Get the screen assigned to detailed views
  const detailedScreenId = await multiScreenManager.getDetailedScreen()
  
  // Construct URL
  let url = chrome.runtime.getURL('detailed.html')
  if (type === 'flight' && id) {
    url += `?type=flight&id=${id}`
  } else {
    url += `?type=${type}`
  }

  // Create window on specified screen
  const window = await multiScreenManager.createWindowOnScreen(
    url, 
    detailedScreenId, 
    options
  )

  return {
    success: !!window,
    windowId: window?.id,
    screen: detailedScreenId
  }
}

async function getScreenRoles() {
  const roles = []
  for (let i = 0; i < multiScreenManager.screens.length; i++) {
    const role = await multiScreenManager.getScreenRole(i)
    roles.push({
      screenId: i,
      role: role || 'unassigned'
    })
  }
  return roles
}

// Handle extension installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('AirOps Multi-Screen Manager installed')
})

console.log('Background script loaded')
