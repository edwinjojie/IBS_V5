import { useState, useEffect, useCallback, useMemo } from 'react'
import { generateUUID } from '@/lib/utils'

interface Screen {
  id: number
  left: number
  top: number
  width: number
  height: number
}

interface ScreenRole {
  screenId: number
  role: 'general' | 'detailed'
  deviceId: string
  sessionId: string
}

export function useMultiScreen() {
  const [screens, setScreens] = useState<Screen[]>([])
  const [currentRole, setCurrentRole] = useState<'general' | 'detailed' | null>(null)
  const [deviceId, setDeviceId] = useState<string>('')
  const [sessionId, setSessionId] = useState<string>('')
  const [isInitialized, setIsInitialized] = useState(false)

  // Memoize device and session IDs to prevent unnecessary re-renders
  const stableDeviceId = useMemo(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('deviceId')
      if (stored) return stored
      const newId = generateUUID()
      localStorage.setItem('deviceId', newId)
      return newId
    }
    return ''
  }, [])

  const stableSessionId = useMemo(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('sessionId')
      if (stored) return stored
      const newId = generateUUID()
      localStorage.setItem('sessionId', newId)
      return newId
    }
    return ''
  }, [])

  // Set device and session IDs once
  useEffect(() => {
    setDeviceId(stableDeviceId)
    setSessionId(stableSessionId)
  }, [stableDeviceId, stableSessionId])

  // Detect available screens with memoization
  const detectScreens = useCallback(async (): Promise<Screen[]> => {
    try {
      if ('getScreenDetails' in window) {
        const screenDetails = await (window as any).getScreenDetails()
        const detectedScreens = screenDetails.screens.map((screen: any, index: number) => ({
          id: index,
          left: screen.left,
          top: screen.top,
          width: screen.width,
          height: screen.height
        }))
        
        console.log('Detected screens using getScreenDetails:', detectedScreens)
        setScreens(detectedScreens)
        return detectedScreens
      } else {
        // Fallback for browsers without getScreenDetails
        console.warn('getScreenDetails not supported, using fallback detection')
        
        // Try to detect multiple screens using other methods
        if (window.screen && window.screen.availWidth) {
          const totalWidth = window.screen.availWidth
          const totalHeight = window.screen.availHeight
          
          // If total width is significantly larger than individual screen width, assume multiple screens
          if (totalWidth > window.innerWidth * 1.5) {
            const fallbackScreens = [
              {
                id: 0,
                left: 0,
                top: 0,
                width: window.innerWidth,
                height: window.innerHeight
              },
              {
                id: 1,
                left: window.innerWidth,
                top: 0,
                width: window.innerWidth,
                height: window.innerHeight
              }
            ]
            console.log('Detected multiple screens using fallback method:', fallbackScreens)
            setScreens(fallbackScreens)
            return fallbackScreens
          }
        }
        
        // Single screen fallback
        const fallbackScreens = [{
          id: 0,
          left: 0,
          top: 0,
          width: window.screen.width,
          height: window.screen.height
        }]
        console.log('Using single screen fallback:', fallbackScreens)
        setScreens(fallbackScreens)
        return fallbackScreens
      }
    } catch (error) {
      console.error('Failed to detect screens:', error)
      // Fallback to single screen
      const fallbackScreens = [{
        id: 0,
        left: 0,
        top: 0,
        width: window.screen.width,
        height: window.screen.height
      }]
      setScreens(fallbackScreens)
      return fallbackScreens
    }
  }, [])

  // Assign role to a specific screen
  const assignRole = useCallback(async (screenId: number, role: 'general' | 'detailed') => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('No authentication token')
      }

      const response = await fetch('http://localhost:3001/api/screens/role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          sessionId: stableSessionId,
          deviceId: stableDeviceId,
          screenId,
          role
        })
      })

      if (!response.ok) {
        throw new Error('Failed to assign screen role')
      }

      // If this is the current screen, update local state
      if (screenId === 0) { // Assuming current screen is always index 0
        setCurrentRole(role)
      }

      return true
    } catch (error) {
      console.error('Failed to assign role:', error)
      return false
    }
  }, [stableSessionId, stableDeviceId])

  // Store screen information in backend
  const storeScreenInfo = useCallback(async (screen: Screen) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('No authentication token')
      }

      const response = await fetch('http://localhost:3001/api/screens/link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          sessionId: stableSessionId,
          deviceId: stableDeviceId,
          screenId: screen.id.toString(),
          left: screen.left,
          

          top: screen.top,
          width: screen.width,
          height: screen.height,
          role: 'unassigned' // Will be assigned later
        })
      })

      if (!response.ok) {
        throw new Error('Failed to store screen information')
      }

      return true
    } catch (error) {
      console.error('Failed to store screen info:', error)
      return false
    }
  }, [stableSessionId, stableDeviceId])

  // Initialize multi-screen setup
  const initializeMultiScreen = useCallback(async () => {
    if (isInitialized) return

    const detectedScreens = await detectScreens()
    
    // Store all detected screens in backend
    for (const screen of detectedScreens) {
      await storeScreenInfo(screen)
    }
    
    if (detectedScreens.length > 1) {
      // Multiple screens detected - need role assignment
      return { needsRoleAssignment: true, screens: detectedScreens }
    } else {
      // Single screen - default to general role
      await assignRole(0, 'general')
      setCurrentRole('general')
      setIsInitialized(true)
      return { needsRoleAssignment: false, screens: detectedScreens }
    }
  }, [detectScreens, assignRole, isInitialized, storeScreenInfo])

  // Get screen roles from backend
  const getScreenRoles = useCallback(async (): Promise<ScreenRole[]> => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('No authentication token')
      }

      const response = await fetch(`http://localhost:3001/api/screens/device/${stableDeviceId}/session/${stableSessionId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch screen roles')
      }

      const screenRoles = await response.json()
      return screenRoles
    } catch (error) {
      console.error('Failed to fetch screen roles:', error)
      return []
    }
  }, [stableDeviceId, stableSessionId])

  // Pop out detailed view to appropriate screen
  const popOutDetailedView = useCallback(async (type: 'flight' | 'alerts' | 'metrics' | 'operations', id?: string) => {
    try {
      // Check if we have multiple screens first
      if (screens.length <= 1) {
        // Single screen detected - open detailed view in new tab
        const url = type === 'flight' ? `/detailed/${id}` : `/detailed/${type}`
        console.log('Single screen detected - opening detailed view in new tab:', url)
        window.open(url, '_blank')  // Open in new tab for single screen
        return
      }

      // Multiple screens detected - get screen roles
      const screenRoles = await getScreenRoles()
      
      // Find the screen assigned the 'detailed' role
      const detailedScreenRole = screenRoles.find(role => role.role === 'detailed')
      
      if (!detailedScreenRole) {
        // Multiple screens but no detailed role assigned - prompt user to assign roles
        console.log('Multiple screens detected but no detailed role assigned')
        // Trigger role assignment modal by dispatching a custom event
        const event = new CustomEvent('showRoleAssignment', {
          detail: { screens, message: 'Please assign screen roles to use detailed views' }
        })
        window.dispatchEvent(event)
        return
      }

      // Find the corresponding screen coordinates from our local screens state
      const detailedScreen = screens.find(screen => screen.id === detailedScreenRole.screenId)
      
      console.log('Screen roles:', screenRoles)
      console.log('Detailed screen role:', detailedScreenRole)
      console.log('All screens:', screens)
      console.log('Found detailed screen:', detailedScreen)
      
      if (!detailedScreen) {
        // Fallback to regular window open if screen coordinates not found
        console.warn('Detailed screen coordinates not found, falling back to new tab')
        const url = type === 'flight' ? `/detailed/${id}` : `/detailed/${type}`
        window.open(url, '_blank')
        return
      }

      // Determine URL and window name based on type
      let url = ''
      let windowName = ''

      switch (type) {
        case 'flight':
          if (!id) return
          url = `/detailed/${id}`
          windowName = `flight-${id}`
          break
        case 'alerts':
          url = '/detailed/alerts'
          windowName = 'alerts-dashboard'
          break
        case 'metrics':
          url = '/detailed/metrics'
          windowName = 'metrics-dashboard'
          break
        case 'operations':
          url = '/detailed/operations'
          windowName = 'operations-dashboard'
          break
        default:
          return
      }

      // Calculate window dimensions and position
      const { left, top, width, height } = detailedScreen
      const windowWidth = Math.min(width - 100, 1400)
      const windowHeight = Math.min(height - 100, 900)
      const windowLeft = left + 50
      const windowTop = top + 50
      
      console.log('Window positioning details:')
      console.log('  Screen coordinates:', { left, top, width, height })
      console.log('  Window dimensions:', { windowWidth, windowHeight })
      console.log('  Window position:', { windowLeft, windowTop })
      console.log('  Current window position:', { left: window.screenX, top: window.screenY })

      // Try multiple approaches to open window on correct screen
      let newWindow: Window | null = null

      // Method 1: Try with explicit positioning
      try {
        newWindow = window.open(
          url,
          windowName,
          `left=${windowLeft},top=${windowTop},width=${windowWidth},height=${windowHeight},scrollbars=yes,resizable=yes,status=yes,toolbar=no,menubar=no,location=no`
        )
        
        if (newWindow && !newWindow.closed) {
          // Verify the window opened successfully
          console.log('Window opened with positioning:', { left: windowLeft, top: windowTop, width: windowWidth, height: windowHeight })
        }
      } catch (error) {
        console.warn('Failed to open window with positioning:', error)
      }

      // Method 2: If Method 1 failed, try without positioning but with screen-specific features
      if (!newWindow || newWindow.closed) {
        try {
          // Open window without positioning first
          newWindow = window.open(url, windowName, 'scrollbars=yes,resizable=yes,status=yes,toolbar=no,menubar=no,location=no')
          
          if (newWindow && !newWindow.closed) {
            // Try to move the window to the correct screen after it opens
            setTimeout(() => {
              try {
                if (newWindow && !newWindow.closed) {
                  // Use moveTo and resizeTo if available
                  if (typeof newWindow.moveTo === 'function' && typeof newWindow.resizeTo === 'function') {
                    newWindow.moveTo(windowLeft, windowTop)
                    newWindow.resizeTo(windowWidth, windowHeight)
                    console.log('Window moved and resized after opening')
                  }
                }
              } catch (moveError) {
                console.warn('Failed to move window after opening:', moveError)
              }
            }, 100)
          }
        } catch (error) {
          console.warn('Failed to open window without positioning:', error)
        }
      }

      // Method 3: Final fallback - check screen count
      if (!newWindow || newWindow.closed) {
        if (screens.length <= 1) {
          // Single screen - open new tab as fallback
          console.warn('Window opening failed, falling back to new tab')
          newWindow = window.open(url, '_blank')
        } else {
          // Multiple screens - try new tab as last resort
          console.warn('All window opening methods failed, falling back to new tab')
          newWindow = window.open(url, '_blank')
        }
      }

      // If we successfully opened a window, set up communication
      if (newWindow && !newWindow.closed) {
        // Send data to the new window
        const setupWindowCommunication = () => {
          try {
            // Send detailed view data
            newWindow!.postMessage({ 
              type: 'DETAILED_VIEW_DATA', 
              viewType: type, 
              id,
              timestamp: Date.now()
            }, '*')
            
            // Send current theme to synchronize
            const currentTheme = localStorage.getItem('vite-ui-theme') || 'system'
            newWindow!.postMessage({
              type: 'THEME_CHANGE',
              theme: currentTheme
            }, '*')

            console.log('Window communication established successfully')
          } catch (error) {
            console.error('Failed to establish window communication:', error)
          }
        }

        // Try to set up communication immediately
        setupWindowCommunication()

        // Also try after a delay to ensure window is fully loaded
        setTimeout(setupWindowCommunication, 500)

        // Listen for window close to clean up
        const checkWindowClosed = setInterval(() => {
          if (newWindow && newWindow.closed) {
            clearInterval(checkWindowClosed)
            console.log('Detailed view window closed')
          }
        }, 1000)
      }

    } catch (error) {
      console.error('Failed to pop out detailed view:', error)
      // Final fallback - always try new tab
      const url = type === 'flight' ? `/detailed/${id}` : `/detailed/${type}`
      console.log('Error fallback: opening new tab')
      window.open(url, '_blank')
    }
  }, [screens, getScreenRoles])

  // Get current screen role
  const getCurrentScreenRole = useCallback(() => {
    return currentRole
  }, [currentRole])

  // Check if multi-screen is supported
  const isMultiScreenSupported = useCallback(() => {
    return 'getScreenDetails' in window
  }, [])

  // Test window opening capabilities
  const testWindowOpening = useCallback(() => {
    console.log('Testing window opening capabilities...')
    
    // Test basic window.open
    try {
      const testWindow = window.open('about:blank', 'test', 'width=400,height=300')
      if (testWindow) {
        console.log('✅ Basic window.open works')
        testWindow.close()
      } else {
        console.log('❌ Basic window.open failed')
      }
    } catch (error) {
      console.log('❌ Basic window.open error:', error)
    }

    // Test window positioning
    try {
      const positionedWindow = window.open('about:blank', 'test-pos', 'left=100,top=100,width=400,height=300')
      if (positionedWindow) {
        console.log('✅ Window positioning works')
        positionedWindow.close()
      } else {
        console.log('❌ Window positioning failed')
      }
    } catch (error) {
      console.log('❌ Window positioning error:', error)
    }

    // Test window methods
    try {
      const methodWindow = window.open('about:blank', 'test-methods', 'width=400,height=300')
      if (methodWindow) {
        if (typeof methodWindow.moveTo === 'function' && typeof methodWindow.resizeTo === 'function') {
          console.log('✅ Window moveTo/resizeTo methods available')
        } else {
          console.log('⚠️ Window moveTo/resizeTo methods not available')
        }
        methodWindow.close()
      }
    } catch (error) {
      console.log('❌ Window methods test error:', error)
    }
  }, [])

  // Memoize the return object to prevent unnecessary re-renders
  return useMemo(() => ({
    screens,
    currentRole,
    deviceId,
    sessionId,
    isInitialized,
    detectScreens,
    assignRole,
    initializeMultiScreen,
    popOutDetailedView,
    getCurrentScreenRole,
    isMultiScreenSupported,
    testWindowOpening
  }), [
    screens,
    currentRole,
    deviceId,
    sessionId,
    isInitialized,
    detectScreens,
    assignRole,
    initializeMultiScreen,
    popOutDetailedView,
    getCurrentScreenRole,
    isMultiScreenSupported,
    testWindowOpening
  ])
}
