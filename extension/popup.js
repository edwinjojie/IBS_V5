// Popup script for extension
document.addEventListener('DOMContentLoaded', async () => {
  console.log('Extension popup loaded')
  
  const statusDiv = document.getElementById('status')
  const statusIcon = document.getElementById('status-icon')
  const statusText = document.getElementById('status-text')
  const screensList = document.getElementById('screens-list')
  const testButton = document.getElementById('test-button')
  const dashboardButton = document.getElementById('open-dashboard')
  
  try {
    // Get screens from background script
    const response = await chrome.runtime.sendMessage({ type: 'GET_SCREENS' })
    const screens = response.screens || []
    
    if (screens.length > 0) {
      statusDiv.className = 'status active'
      statusIcon.textContent = '✅'
      statusText.textContent = `${screens.length} screen(s) detected`
      testButton.disabled = false
      
      // Display screens
      screensList.innerHTML = screens.map((screen, index) => `
        <div class="screen ${screen.isPrimary ? 'primary' : ''}">
          <strong>Screen ${index + 1}${screen.isPrimary ? ' (Primary)' : ''}</strong><br>
          ${screen.width} × ${screen.height}<br>
          Position: (${screen.left}, ${screen.top})
        </div>
      `).join('')
    } else {
      statusDiv.className = 'status inactive'
      statusIcon.textContent = '❌'
      statusText.textContent = 'No screens detected'
      screensList.innerHTML = '<div style="color: #666;">No screens found</div>'
    }
    
  } catch (error) {
    console.error('Failed to get screens:', error)
    statusDiv.className = 'status inactive'
    statusIcon.textContent = '❌'
    statusText.textContent = 'Extension error'
    screensList.innerHTML = '<div style="color: #b91c1c;">Extension initialization failed</div>'
  }
  
  // Test button handler
  testButton.addEventListener('click', async () => {
    testButton.disabled = true
    testButton.textContent = 'Testing...'
    
    try {
      const result = await chrome.runtime.sendMessage({
        type: 'POPUP_DETAILED_VIEW',
        type: 'alerts',
        options: { width: 800, height: 600 }
      })
      
      if (result.success) {
        statusText.textContent = `Test successful! Window opened on screen ${result.screen}`
        statusIcon.textContent = '🎉'
      } else {
        statusText.textContent = 'Test failed'
        statusIcon.textContent = '❌'
      }
    } catch (error) {
      console.error('Test failed:', error)
      statusText.textContent = 'Test error'
      statusIcon.textContent = '❌'
    }
    
    testButton.disabled = false
    testButton.textContent = 'Test Multi-Screen'
  })
  
  // Dashboard button handler
  dashboardButton.addEventListener('click', async () => {
    try {
      await chrome.tabs.create({
        url: 'http://localhost:3000'
      })
      window.close()
    } catch (error) {
      console.error('Failed to open dashboard:', error)
    }
  })
})
