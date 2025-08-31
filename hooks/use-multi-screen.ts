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
        setScreens(detectedScreens)
        return detectedScreens
      } else {
        // Fallback for browsers without getScreenDetails
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
      // Get screen roles from backend to find the detailed screen
      const screenRoles = await getScreenRoles()
      
      // Find the screen assigned the 'detailed' role
      const detailedScreenRole = screenRoles.find(role => role.role === 'detailed')
      
      if (!detailedScreenRole) {
        // No detailed screen available, open in current window
        const url = type === 'flight' ? `/detailed/${id}` : `/detailed/${type}`
        window.open(url, '_blank')
        return
      }

      // Find the corresponding screen coordinates from our local screens state
      const detailedScreen = screens.find(screen => screen.id === detailedScreenRole.screenId)
      
      if (!detailedScreen) {
        // Fallback to regular window open if screen coordinates not found
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

      // Open window on the detailed screen with proper positioning
      const { left, top, width, height } = detailedScreen
      const newWindow = window.open(
        url,
        windowName,
        `left=${left + 50},top=${top + 50},width=${Math.min(width - 100, 1400)},height=${Math.min(height - 100, 900)}`
      )

      if (newWindow) {
        // Send data to the new window
        newWindow.addEventListener('load', () => {
          newWindow.postMessage({ 
            type: 'DETAILED_VIEW_DATA', 
            viewType: type, 
            id,
            timestamp: Date.now()
          }, '*')
        })
      }
    } catch (error) {
      console.error('Failed to pop out detailed view:', error)
      // Fallback to regular window open
      const url = type === 'flight' ? `/detailed/${id}` : `/detailed/${type}`
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
    isMultiScreenSupported
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
    isMultiScreenSupported
  ])
}
