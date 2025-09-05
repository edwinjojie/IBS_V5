// Injected script - provides extension API to web page
(function() {
  'use strict'
  
  console.log('AirOps Extension API injected')

  let extensionReady = false
  let requestId = 0
  const pendingRequests = new Map()

  // Listen for extension ready signal
  window.addEventListener('message', (event) => {
    if (event.source !== window) return
    
    if (event.data.type === 'AIROPS_EXTENSION_READY') {
      extensionReady = true
      console.log('Extension ready:', event.data.extensionId)
      
      // Trigger custom event for web app
      window.dispatchEvent(new CustomEvent('airopsExtensionReady', {
        detail: { extensionId: event.data.extensionId }
      }))
    }
    
    // Handle responses
    if (event.data.type && event.data.type.endsWith('_RESPONSE')) {
      const request = pendingRequests.get(event.data.requestId)
      if (request) {
        pendingRequests.delete(event.data.requestId)
        
        if (event.data.success) {
          request.resolve(event.data.data)
        } else {
          request.reject(new Error(event.data.error))
        }
      }
    }
  })

  // Extension API
  const AirOpsExtension = {
    isReady() {
      return extensionReady
    },

    async waitForReady(timeout = 5000) {
      if (extensionReady) return true
      
      return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
          reject(new Error('Extension ready timeout'))
        }, timeout)
        
        window.addEventListener('airopsExtensionReady', () => {
          clearTimeout(timer)
          resolve(true)
        }, { once: true })
      })
    },

    async sendMessage(type, payload) {
      if (!extensionReady) {
        throw new Error('Extension not ready')
      }

      return new Promise((resolve, reject) => {
        const currentRequestId = ++requestId
        
        pendingRequests.set(currentRequestId, { resolve, reject })
        
        window.postMessage({
          type: `AIROPS_EXTENSION_${type}`,
          requestId: currentRequestId,
          payload: payload || {}
        }, '*')
        
        // Timeout after 10 seconds
        setTimeout(() => {
          if (pendingRequests.has(currentRequestId)) {
            pendingRequests.delete(currentRequestId)
            reject(new Error('Request timeout'))
          }
        }, 10000)
      })
    },

    async getScreens() {
      return this.sendMessage('GET_SCREENS')
    },

    async assignRole(screenId, role) {
      return this.sendMessage('ASSIGN_ROLE', { screenId, role })
    },

    async getScreenRoles() {
      return this.sendMessage('GET_SCREEN_ROLES')
    },

    async popOutDetailedView(type, id, options) {
      return this.sendMessage('POPUP_DETAILED_VIEW', { type, id, options })
    }
  }

  // Make API available globally
  window.AirOpsExtension = AirOpsExtension
  
  // Also make it available as module for modern apps
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = AirOpsExtension
  }
  
  console.log('AirOps Extension API ready')
})()
