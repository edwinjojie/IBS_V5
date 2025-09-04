import { useState, useEffect, useCallback, useMemo } from 'react'
import { generateUUID } from '@/lib/utils'

interface Screen {
  id: number
  left: number
  top: number
  width: number
  height: number
  isPrimary?: boolean
  devicePixelRatio?: number
}

interface ScreenRole {
  screenId: number
  role: 'general' | 'detailed'
  deviceId: string
  sessionId: string
}

interface ScreenDetails {
  screens: Screen[]
  currentScreenIndex: number
}

export function useMultiScreenFixed() {
  const [screens, setScreens] = useState<Screen[]>([])
  const [currentRole, setCurrentRole] = useState<'general' | 'detailed' | null>(null)
  const [currentScreenIndex, setCurrentScreenIndex] = useState<number>(0)
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

  // Enhanced screen detection with better current screen identification
  const detectScreens = useCallback(async (): Promise<Screen[]> => {
    try {
      if ('getScreenDetails' in window) {
        const screenDetails = await (window as any).getScreenDetails()
        const currentScreen = screenDetails.currentScreen
        
        const detectedScreens = screenDetails.screens.map((screen: any, index: number) => ({
          id: index,
          left: screen.left,
          top: screen.top,
          width: screen.width,
          height: screen.height,
          isPrimary: screen.isPrimary || false,
          devicePixelRatio: screen.devicePixelRatio || 1
        }))

        // Find current screen index by comparing coordinates
        let currentIndex = 0
        if (currentScreen) {
          currentIndex = detectedScreens.findIndex((screen: Screen) => 
            screen.left === currentScreen.left && 
            screen.top === currentScreen.top &&
            screen.width === currentScreen.width &&
            screen.height === currentScreen.height
          )
          if (currentIndex === -1) currentIndex = 0 // Fallback to first screen
        }
        
        console.log('Detected screens using getScreenDetails:', detectedScreens)
        console.log('Current screen index:', currentIndex)
        
        setScreens(detectedScreens)
        setCurrentScreenIndex(currentIndex)
        return detectedScreens
      } else {
        // Enhanced fallback detection
        console.warn('getScreenDetails not supported, using enhanced fallback detection')
        
        // Get screen information
        const screenInfo = window.screen
        const totalWidth = screenInfo.availWidth
        const totalHeight = screenInfo.availHeight
        const screenWidth = screenInfo.width
        const screenHeight = screenInfo.height
        
        // Detect if we likely have multiple screens
        if (totalWidth > screenWidth * 1.2 || totalHeight > screenHeight * 1.2) {
          // Try to estimate screen layout
          const estimatedScreens = []
          
          // Primary screen (current)
          estimatedScreens.push({
            id: 0,
            left: 0,
            top: 0,
            width: screenWidth,
            height: screenHeight,
            isPrimary: true,
            devicePixelRatio: window.devicePixelRatio || 1
          })
          
          // Estimate secondary screen position
          // Assume horizontal layout first
          if (totalWidth > screenWidth * 1.2) {
            estimatedScreens.push({
              id: 1,
              left: screenWidth,
              top: 0,
              width: Math.min(screenWidth, totalWidth - screenWidth),
              height: screenHeight,
              isPrimary: false,
              devicePixelRatio: window.devicePixelRatio || 1
            })
          }
          // Check for vertical layout
          else if (totalHeight > screenHeight * 1.2) {
            estimatedScreens.push({
              id: 1,
              left: 0,
              top: screenHeight,
              width: screenWidth,
              height: Math.min(screenHeight, totalHeight - screenHeight),
              isPrimary: false,
              devicePixelRatio: window.devicePixelRatio || 1
            })
          }
          
          console.log('Detected multiple screens using enhanced fallback:', estimatedScreens)
          setScreens(estimatedScreens)
          setCurrentScreenIndex(0) // Primary screen
          return estimatedScreens
        }
        
        // Single screen fallback
        const fallbackScreens = [{
          id: 0,
          left: 0,
          top: 0,
          width: screenWidth,
          height: screenHeight,
          isPrimary: true,
          devicePixelRatio: window.devicePixelRatio || 1
        }]
        
        console.log('Using single screen fallback:', fallbackScreens)
        setScreens(fallbackScreens)
        setCurrentScreenIndex(0)
        return fallbackScreens
      }
    } catch (error) {
      console.error('Failed to detect screens:', error)
      // Enhanced error fallback
      const fallbackScreens = [{
        id: 0,
        left: 0,
        top: 0,
        width: window.screen.width,
        height: window.screen.height,
        isPrimary: true,
        devicePixelRatio: window.devicePixelRatio || 1
      }]
      setScreens(fallbackScreens)
      setCurrentScreenIndex(0)
      return fallbackScreens
    }
  }, [])

  // Enhanced role assignment with proper screen mapping
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

      // Update local state if this is the current screen
      if (screenId === currentScreenIndex) {
        setCurrentRole(role)
      }

      return true
    } catch (error) {
      console.error('Failed to assign role:', error)
      return false
    }
  }, [stableSessionId, stableDeviceId, currentScreenIndex])

  // Store screen information in backend with enhanced data
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
          isPrimary: screen.isPrimary || false,
          devicePixelRatio: screen.devicePixelRatio || 1,
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

  // Enhanced pop-out function with better window placement
  const popOutDetailedView = useCallback(async (type: 'flight' | 'alerts' | 'metrics' | 'operations', id?: string) => {
    try {
      console.log('=== Pop Out Detailed View Debug ===')
      console.log('Type:', type, 'ID:', id)
      console.log('Available screens:', screens)
      console.log('Current screen index:', currentScreenIndex)

      // Check if we have multiple screens first
      if (screens.length <= 1) {
        // Single screen detected - open detailed view in new tab
        const url = type === 'flight' ? `/detailed/${id}` : `/detailed/${type}`
        console.log('Single screen detected - opening detailed view in new tab:', url)
        window.open(url, '_blank')
        return
      }

      // Multiple screens detected - get screen roles
      const screenRoles = await getScreenRoles()
      console.log('Screen roles from backend:', screenRoles)
      
      // Find the screen assigned the 'detailed' role
      const detailedScreenRole = screenRoles.find(role => role.role === 'detailed')
      console.log('Detailed screen role:', detailedScreenRole)
      
      if (!detailedScreenRole) {
        // Multiple screens but no detailed role assigned - prompt user to assign roles
        console.log('Multiple screens detected but no detailed role assigned')
        const event = new CustomEvent('showRoleAssignment', {
          detail: { screens, message: 'Please assign screen roles to use detailed views' }
        })
        window.dispatchEvent(event)
        return
      }

      // Find the corresponding screen using enhanced matching
      const detailedScreen = screens.find(screen => 
        screen.id === detailedScreenRole.screenId ||
        screen.id === parseInt(detailedScreenRole.screenId?.toString() || '0')
      )
      
      console.log('Found detailed screen:', detailedScreen)
      console.log('Screen matching debug:', {
        searchingFor: detailedScreenRole.screenId,
        availableScreens: screens.map(s => ({ id: s.id, left: s.left, top: s.top }))
      })
      
      if (!detailedScreen) {
        // Fallback to secondary screen if no exact match
        const secondaryScreen = screens.find(screen => screen.id !== currentScreenIndex)
        if (secondaryScreen) {
          console.warn('Using secondary screen as fallback:', secondaryScreen)
          await openWindowOnScreen(secondaryScreen, type, id)
          return
        }
        
        // Final fallback
        console.warn('No suitable screen found, falling back to new tab')
        const url = type === 'flight' ? `/detailed/${id}` : `/detailed/${type}`
        window.open(url, '_blank')
        return
      }

      await openWindowOnScreen(detailedScreen, type, id)

    } catch (error) {
      console.error('Failed to pop out detailed view:', error)
      // Final fallback - always try new tab
      const url = type === 'flight' ? `/detailed/${id}` : `/detailed/${type}`
      console.log('Error fallback: opening new tab')
      window.open(url, '_blank')
    }
  }, [screens, currentScreenIndex, getScreenRoles])

  // Separate function for opening window on specific screen
  const openWindowOnScreen = async (screen: Screen, type: string, id?: string) => {
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

    // Enhanced window positioning calculation
    const { left, top, width, height, devicePixelRatio = 1 } = screen
    
    // Calculate optimal window size (80% of screen size with min/max constraints)
    const windowWidth = Math.max(800, Math.min(width * 0.8, 1600))
    const windowHeight = Math.max(600, Math.min(height * 0.8, 1200))
    
    // Center the window on the target screen
    const windowLeft = left + (width - windowWidth) / 2
    const windowTop = top + (height - windowHeight) / 2
    
    console.log('Enhanced window positioning:')
    console.log('  Target screen:', { left, top, width, height, devicePixelRatio })
    console.log('  Window size:', { windowWidth, windowHeight })
    console.log('  Window position:', { windowLeft, windowTop })
    console.log('  Current window position:', { x: window.screenX, y: window.screenY })

    // Enhanced window opening with multiple methods
    let newWindow: Window | null = null
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
      'location=no',
      'directories=no'
    ].join(',')

    // Method 1: Direct positioning with enhanced features
    try {
      console.log('Attempting Method 1: Direct positioning')
      newWindow = window.open(url, windowName, features)
      
      if (newWindow && !newWindow.closed) {
        console.log('✅ Method 1 successful: Window opened with direct positioning')
        
        // Verify window position after a brief delay
        setTimeout(() => {
          if (newWindow && !newWindow.closed) {
            const actualX = newWindow.screenX || newWindow.screenLeft || 0
            const actualY = newWindow.screenY || newWindow.screenTop || 0
            console.log('Window position verification:', { 
              expected: { x: windowLeft, y: windowTop },
              actual: { x: actualX, y: actualY },
              difference: { 
                x: Math.abs(actualX - windowLeft), 
                y: Math.abs(actualY - windowTop) 
              }
            })
          }
        }, 500)
      }
    } catch (error) {
      console.warn('Method 1 failed:', error)
    }

    // Method 2: Open first, then position
    if (!newWindow || newWindow.closed) {
      try {
        console.log('Attempting Method 2: Open then position')
        newWindow = window.open(url, windowName, 'scrollbars=yes,resizable=yes')
        
        if (newWindow && !newWindow.closed) {
          // Multiple attempts to position the window
          const positionAttempts = [100, 250, 500, 1000]
          
          positionAttempts.forEach((delay, index) => {
            setTimeout(() => {
              if (newWindow && !newWindow.closed) {
                try {
                  newWindow.moveTo(Math.round(windowLeft), Math.round(windowTop))
                  newWindow.resizeTo(Math.round(windowWidth), Math.round(windowHeight))
                  
                  if (index === 0) console.log('✅ Method 2 successful: Window repositioned')
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

    // Method 3: Force focus on target screen (if supported)
    if (!newWindow || newWindow.closed) {
      try {
        console.log('Attempting Method 3: Focus-based positioning')
        
        // Try to request fullscreen on target screen first (if supported)
        if ('requestFullscreen' in document.documentElement) {
          // This is experimental and may not work in all browsers
        }
        
        newWindow = window.open(url, windowName, features)
        
        if (newWindow && !newWindow.closed) {
          // Force focus and bring to front
          newWindow.focus()
          console.log('✅ Method 3 successful: Window opened with focus')
        }
      } catch (error) {
        console.warn('Method 3 failed:', error)
      }
    }

    // Final fallback
    if (!newWindow || newWindow.closed) {
      console.warn('All positioning methods failed, opening as new tab')
      newWindow = window.open(url, '_blank')
    }

    // Set up communication if window opened successfully
    if (newWindow && !newWindow.closed) {
      setupWindowCommunication(newWindow, type, id)
    }
  }

  // Enhanced window communication setup
  const setupWindowCommunication = (targetWindow: Window, type: string, id?: string) => {
    const sendData = () => {
      try {
        if (targetWindow && !targetWindow.closed) {
          // Send detailed view data
          targetWindow.postMessage({ 
            type: 'DETAILED_VIEW_DATA', 
            viewType: type, 
            id,
            timestamp: Date.now(),
            screenInfo: {
              currentScreen: currentScreenIndex,
              totalScreens: screens.length
            }
          }, '*')
          
          // Send current theme to synchronize
          const currentTheme = localStorage.getItem('vite-ui-theme') || 'system'
          targetWindow.postMessage({
            type: 'THEME_CHANGE',
            theme: currentTheme
          }, '*')

          console.log('✅ Window communication established')
        }
      } catch (error) {
        console.error('Failed to establish window communication:', error)
      }
    }

    // Try immediately and with delays
    sendData()
    setTimeout(sendData, 500)
    setTimeout(sendData, 1500)

    // Set up cleanup
    const cleanupInterval = setInterval(() => {
      if (targetWindow && targetWindow.closed) {
        clearInterval(cleanupInterval)
        console.log('Detailed view window closed - cleanup completed')
      }
    }, 1000)
  }

  // Enhanced window opening test
  const testWindowOpening = useCallback(() => {
    console.log('=== Testing Window Opening Capabilities ===')
    
    const tests = [
      {
        name: 'Basic window.open',
        test: () => {
          const testWindow = window.open('about:blank', 'basic-test', 'width=400,height=300')
          if (testWindow) {
            console.log('✅ Basic window.open works')
            setTimeout(() => testWindow.close(), 1000)
            return true
          } else {
            console.log('❌ Basic window.open failed (likely popup blocked)')
            return false
          }
        }
      },
      {
        name: 'Positioned window.open',
        test: () => {
          const testWindow = window.open('about:blank', 'positioned-test', 'left=200,top=200,width=400,height=300')
          if (testWindow) {
            console.log('✅ Positioned window.open works')
            setTimeout(() => {
              const actualX = testWindow.screenX || testWindow.screenLeft || 0
              const actualY = testWindow.screenY || testWindow.screenTop || 0
              console.log(`   Window positioned at: ${actualX}, ${actualY}`)
              testWindow.close()
            }, 1000)
            return true
          } else {
            console.log('❌ Positioned window.open failed')
            return false
          }
        }
      },
      {
        name: 'Window methods availability',
        test: () => {
          const testWindow = window.open('about:blank', 'methods-test', 'width=400,height=300')
          if (testWindow) {
            const hasMoveTo = typeof testWindow.moveTo === 'function'
            const hasResizeTo = typeof testWindow.resizeTo === 'function'
            console.log(`✅ Window methods: moveTo=${hasMoveTo}, resizeTo=${hasResizeTo}`)
            
            if (hasMoveTo && hasResizeTo) {
              setTimeout(() => {
                testWindow.moveTo(300, 300)
                testWindow.resizeTo(500, 400)
                console.log('   Methods executed successfully')
                setTimeout(() => testWindow.close(), 1000)
              }, 500)
            } else {
              setTimeout(() => testWindow.close(), 1000)
            }
            return hasMoveTo && hasResizeTo
          } else {
            console.log('❌ Could not test window methods')
            return false
          }
        }
      }
    ]

    tests.forEach(({ name, test }) => {
      try {
        console.log(`Testing: ${name}`)
        test()
      } catch (error) {
        console.log(`❌ ${name} error:`, error)
      }
    })
  }, [])

  // Get current screen role
  const getCurrentScreenRole = useCallback(() => {
    return currentRole
  }, [currentRole])

  // Check if multi-screen is supported
  const isMultiScreenSupported = useCallback(() => {
    return 'getScreenDetails' in window
  }, [])

  // Memoize the return object to prevent unnecessary re-renders
  return useMemo(() => ({
    screens,
    currentRole,
    currentScreenIndex,
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
    currentScreenIndex,
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
