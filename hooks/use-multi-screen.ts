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

  // Helper function to get current screen ID
  const getCurrentScreenId = useCallback(async (): Promise<number> => {
    try {
      if ('getScreenDetails' in window) {
        const screenDetails = await (window as any).getScreenDetails()
        const currentScreen = screenDetails.currentScreen
        
        if (currentScreen) {
          // Find matching screen by coordinates
          const matchingScreenIndex = screens.findIndex(screen => 
            screen.left === currentScreen.left && 
            screen.top === currentScreen.top &&
            screen.width === currentScreen.width &&
            screen.height === currentScreen.height
          )
          return matchingScreenIndex >= 0 ? matchingScreenIndex : 0
        }
      }
    } catch (error) {
      console.warn('Could not determine current screen:', error)
    }
    return 0 // Default to first screen
  }, [screens])

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
        console.log('Current screen info:', screenDetails.currentScreen)
        setScreens(detectedScreens)
        return detectedScreens
      } else {
        // Fallback for browsers without getScreenDetails
        console.warn('getScreenDetails not supported, using fallback detection')
        
        // Enhanced fallback detection using proper screen dimensions
        if (window.screen) {
          const totalWidth = window.screen.availWidth
          const totalHeight = window.screen.availHeight
          const screenWidth = window.screen.width
          const screenHeight = window.screen.height
          
          // If total available area is significantly larger than screen size, assume multiple screens
          if (totalWidth > screenWidth * 1.2 || totalHeight > screenHeight * 1.2) {
            const fallbackScreens = [
              {
                id: 0,
                left: 0,
                top: 0,
                width: screenWidth,
                height: screenHeight
              }
            ]
            
            // Estimate second screen position based on total dimensions
            if (totalWidth > screenWidth * 1.2) {
              // Horizontal layout
              fallbackScreens.push({
                id: 1,
                left: screenWidth,
                top: 0,
                width: Math.min(screenWidth, totalWidth - screenWidth),
                height: screenHeight
              })
            } else if (totalHeight > screenHeight * 1.2) {
              // Vertical layout
              fallbackScreens.push({
                id: 1,
                left: 0,
                top: screenHeight,
                width: screenWidth,
                height: Math.min(screenHeight, totalHeight - screenHeight)
              })
            }
            
            console.log('Detected multiple screens using enhanced fallback method:', fallbackScreens)
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

      // Update local state for the correct screen
      // Find current screen by comparing with current window position
      const currentScreenId = await getCurrentScreenId()
      if (screenId === currentScreenId) {
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

      // Enhanced screen matching with multiple fallback strategies
      let detailedScreen = screens.find(screen => 
        screen.id === detailedScreenRole.screenId ||
        screen.id === parseInt(detailedScreenRole.screenId?.toString() || '0')
      )
      
      console.log('Screen roles:', screenRoles)
      console.log('Detailed screen role:', detailedScreenRole)
      console.log('All screens:', screens)
      console.log('Found detailed screen:', detailedScreen)
      
      // Fallback strategies if exact match not found
      if (!detailedScreen) {
        console.warn('Exact screen match not found, trying fallback strategies')
        
        // Strategy 1: Use any non-primary screen
        detailedScreen = screens.find(screen => screen.id !== 0)
        
        // Strategy 2: If only two screens, use the other one
        if (!detailedScreen && screens.length === 2) {
          const currentScreenId = await getCurrentScreenId()
          detailedScreen = screens.find(screen => screen.id !== currentScreenId)
        }
        
        // Strategy 3: Use largest available screen
        if (!detailedScreen) {
          detailedScreen = screens.reduce((largest, current) => 
            (current.width * current.height) > (largest.width * largest.height) ? current : largest
          )
        }
        
        console.log('Using fallback screen:', detailedScreen)
      }
      
      if (!detailedScreen) {
        // Final fallback to regular window open if no screen found
        console.warn('No suitable screen found, falling back to new tab')
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

      // Enhanced window dimensions and position calculation
      const { left, top, width, height } = detailedScreen
      
      // Calculate optimal window size (80% of screen with constraints)
      const windowWidth = Math.max(800, Math.min(width * 0.8, 1600))
      const windowHeight = Math.max(600, Math.min(height * 0.8, 1200))
      
      // Center window on target screen
      const windowLeft = left + (width - windowWidth) / 2
      const windowTop = top + (height - windowHeight) / 2
      
      console.log('Window positioning details:')
      console.log('  Screen coordinates:', { left, top, width, height })
      console.log('  Window dimensions:', { windowWidth, windowHeight })
      console.log('  Window position:', { windowLeft, windowTop })
      console.log('  Current window position:', { left: window.screenX, top: window.screenY })

      // Try multiple approaches to open window on correct screen
      let newWindow: Window | null = null

      // Method 1: Enhanced direct positioning with better feature string
      const features = [
        `left=${Math.round(windowLeft)}`,
        `top=${Math.round(windowTop)}`,
        `width=${Math.round(windowWidth)}`,
        `height=${Math.round(windowHeight)}`,
        'scrollbars=yes',
        'resizable=yes',
        'status=no',
        'toolbar=no',
        'menubar=no',
        'location=no'
      ].join(',')
      
      try {
        console.log('Method 1: Attempting direct positioning with features:', features)
        newWindow = window.open(url, windowName, features)
        
        if (newWindow && !newWindow.closed) {
          console.log('✅ Method 1 successful: Window opened with direct positioning')
          
          // Verify positioning after brief delay
          setTimeout(() => {
            if (newWindow && !newWindow.closed) {
              const actualX = newWindow.screenX || newWindow.screenLeft || 0
              const actualY = newWindow.screenY || newWindow.screenTop || 0
              console.log('Position verification:', {
                expected: { x: Math.round(windowLeft), y: Math.round(windowTop) },
                actual: { x: actualX, y: actualY },
                onCorrectScreen: actualX >= left && actualX <= (left + width) && actualY >= top && actualY <= (top + height)
              })
            }
          }, 1000)
        }
      } catch (error) {
        console.warn('Method 1 failed:', error)
      }

      // Method 2: Enhanced open-then-position with multiple attempts
      if (!newWindow || newWindow.closed) {
        try {
          console.log('Method 2: Open first, then position')
          newWindow = window.open(url, windowName, 'scrollbars=yes,resizable=yes,toolbar=no,menubar=no')
          
          if (newWindow && !newWindow.closed) {
            console.log('✅ Window opened, attempting positioning...')
            
            // Multiple positioning attempts with increasing delays
            const positionAttempts = [100, 300, 600, 1200]
            let positionSuccess = false
            
            positionAttempts.forEach((delay, index) => {
              setTimeout(() => {
                if (newWindow && !newWindow.closed && !positionSuccess) {
                  try {
                    if (typeof newWindow.moveTo === 'function' && typeof newWindow.resizeTo === 'function') {
                      newWindow.moveTo(Math.round(windowLeft), Math.round(windowTop))
                      newWindow.resizeTo(Math.round(windowWidth), Math.round(windowHeight))
                      
                      // Verify positioning
                      setTimeout(() => {
                        if (newWindow && !newWindow.closed) {
                          const actualX = newWindow.screenX || newWindow.screenLeft || 0
                          const actualY = newWindow.screenY || newWindow.screenTop || 0
                          const onTargetScreen = actualX >= left && actualX <= (left + width) && actualY >= top && actualY <= (top + height)
                          
                          if (onTargetScreen && !positionSuccess) {
                            positionSuccess = true
                            console.log(`✅ Method 2 successful: Window positioned on attempt ${index + 1}`)
                          } else if (index === positionAttempts.length - 1) {
                            console.warn('❌ Method 2: All positioning attempts failed')
                          }
                        }
                      }, 100)
                    } else {
                      console.warn('Window moveTo/resizeTo methods not available')
                    }
                  } catch (moveError) {
                    console.warn(`Position attempt ${index + 1} failed:`, moveError)
                  }
                }
              }, delay)
            })
          }
        } catch (error) {
          console.warn('Method 2 failed:', error)
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
              timestamp: Date.now(),
              screenInfo: {
                targetScreen: detailedScreen,
                allScreens: screens
              }
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
