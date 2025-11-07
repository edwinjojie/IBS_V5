import { useState, useEffect, useCallback, useMemo } from 'react'

interface Screen {
  id: number
  left: number
  top: number
  width: number
  height: number
  isPrimary?: boolean
}

interface ScreenRole {
  screenId: number
  role: 'general' | 'detailed'
}

type LayoutType = 'grid' | 'rows' | 'columns' | 'custom'

interface LayoutOptions {
  layout?: LayoutType
  totalSlots?: number
  slotIndex?: number
  paddingPx?: number
  explicitRect?: { left: number; top: number; width: number; height: number }
}

export function useMultiScreenExtension() {
  const [screens, setScreens] = useState<Screen[]>([])
  const [screenRoles, setScreenRoles] = useState<ScreenRole[]>([])
  const [extensionAvailable, setExtensionAvailable] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  // Check if extension is available
  useEffect(() => {
    const checkExtension = async () => {
      try {
        // Wait for extension API to be injected
        if (window.AirOpsExtension) {
          await window.AirOpsExtension.waitForReady()
          setExtensionAvailable(true)
          console.log('✅ AirOps Extension detected and ready')
          return
        }

        // Listen for extension ready event
        const handleExtensionReady = () => {
          setExtensionAvailable(true)
          console.log('✅ AirOps Extension ready event received')
        }

        window.addEventListener('airopsExtensionReady', handleExtensionReady)

        // Timeout after 3 seconds if extension not found
        setTimeout(() => {
          if (!extensionAvailable) {
            console.warn('❌ AirOps Extension not found - falling back to basic functionality')
          }
          window.removeEventListener('airopsExtensionReady', handleExtensionReady)
        }, 3000)

      } catch (error) {
        console.error('Extension check failed:', error)
      }
    }

    checkExtension()
  }, [])

  // Initialize extension functionality
  useEffect(() => {
    if (!extensionAvailable) return

    const initializeExtension = async () => {
      try {
        // Get screens from extension
        const result = await window.AirOpsExtension.getScreens()
        console.log('Extension screens:', result.screens)
        setScreens(result.screens || [])

        // Get screen roles
        const rolesResult = await window.AirOpsExtension.getScreenRoles()
        console.log('Extension screen roles:', rolesResult.roles)
        setScreenRoles(rolesResult.roles || [])

        setIsInitialized(true)
        console.log('✅ Multi-screen extension initialized')

      } catch (error) {
        console.error('Failed to initialize extension:', error)
      }
    }

    initializeExtension()
  }, [extensionAvailable])

  // Assign role to screen
  const assignRole = useCallback(async (screenId: number, role: 'general' | 'detailed') => {
    if (!extensionAvailable) {
      console.warn('Extension not available for role assignment')
      return false
    }

    try {
      await window.AirOpsExtension.assignRole(screenId, role)
      
      // Update local state
      setScreenRoles(prev => {
        const filtered = prev.filter(r => r.screenId !== screenId)
        return [...filtered, { screenId, role }]
      })

      console.log(`✅ Assigned role "${role}" to screen ${screenId}`)
      return true

    } catch (error) {
      console.error('Failed to assign role:', error)
      return false
    }
  }, [extensionAvailable])

  // Pop out detailed view to correct screen
  const popOutDetailedView = useCallback(async (type: 'flight' | 'alerts' | 'metrics' | 'operations', id?: string, layoutOptions?: LayoutOptions) => {
    console.log('=== Pop Out Detailed View (Extension) ===')
    console.log('Type:', type, 'ID:', id)
    console.log('Extension available:', extensionAvailable)
    console.log('Screens:', screens.length)

    if (!extensionAvailable) {
      console.warn('⚠️ Extension not available - falling back to regular window.open')
      const url = type === 'flight' ? `/detailed/${id}` : `/detailed/${type}`
      window.open(url, '_blank')
      return
    }

    if (screens.length <= 1) {
      console.log('Single screen detected - opening in new tab')
      const url = type === 'flight' ? `/detailed/${id}` : `/detailed/${type}`
      window.open(url, '_blank')
      return
    }

    try {
      // Use extension to open window on correct screen
      const result = await window.AirOpsExtension.popOutDetailedView(type, id, layoutOptions || { width: 1200, height: 800 })

      if (result.success) {
        console.log(`🎉 SUCCESS! Window opened on screen ${result.screen}`)
        console.log('Window ID:', result.windowId)
      } else {
        console.error('❌ Failed to open window via extension')
        // Fallback to regular window
        const url = type === 'flight' ? `/detailed/${id}` : `/detailed/${type}`
        window.open(url, '_blank')
      }

    } catch (error) {
      console.error('Extension pop-out failed:', error)
      // Fallback to regular window
      const url = type === 'flight' ? `/detailed/${id}` : `/detailed/${type}`
      window.open(url, '_blank')
    }
  }, [extensionAvailable, screens])

  // Check if multi-screen is supported
  const isMultiScreenSupported = useCallback(() => {
    return extensionAvailable && screens.length > 1
  }, [extensionAvailable, screens.length])

  // Initialize multi-screen setup
  const initializeMultiScreen = useCallback(async () => {
    if (isInitialized) return { needsRoleAssignment: false, screens }

    if (!extensionAvailable) {
      console.log('Extension not available - basic functionality only')
      return { needsRoleAssignment: false, screens: [] }
    }

    if (screens.length > 1) {
      // Check if roles are assigned
      const unassignedScreens = screenRoles.filter(role => role.role === 'unassigned' || !role.role)
      const needsRoleAssignment = unassignedScreens.length > 0

      console.log('Multi-screen setup:', {
        totalScreens: screens.length,
        assignedRoles: screenRoles.length,
        needsRoleAssignment
      })

      return { needsRoleAssignment, screens }
    } else {
      console.log('Single screen detected - no role assignment needed')
      return { needsRoleAssignment: false, screens }
    }
  }, [extensionAvailable, screens, screenRoles, isInitialized])

  // Get current screen role
  const getCurrentScreenRole = useCallback(() => {
    // In extension mode, the role is handled by the extension
    return screenRoles.find(role => role.screenId === 0)?.role || null
  }, [screenRoles])

  // Test extension functionality
  const testExtensionConnection = useCallback(async () => {
    if (!extensionAvailable) {
      return { success: false, error: 'Extension not available' }
    }

    try {
      const result = await window.AirOpsExtension.getScreens()
      return {
        success: true,
        screens: result.screens,
        extensionId: window.AirOpsExtension.isReady()
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }, [extensionAvailable])

  return useMemo(() => ({
    screens,
    screenRoles,
    extensionAvailable,
    isInitialized,
    isMultiScreenSupported,
    assignRole,
    popOutDetailedView,
    initializeMultiScreen,
    getCurrentScreenRole,
    testExtensionConnection
  }), [
    screens,
    screenRoles,
    extensionAvailable,
    isInitialized,
    isMultiScreenSupported,
    assignRole,
    popOutDetailedView,
    initializeMultiScreen,
    getCurrentScreenRole,
    testExtensionConnection
  ])
}

// Type declarations for extension API
declare global {
  interface Window {
    AirOpsExtension?: {
      isReady(): boolean
      waitForReady(timeout?: number): Promise<boolean>
      getScreens(): Promise<{ screens: Screen[] }>
      assignRole(screenId: number, role: string): Promise<{ success: boolean }>
      getScreenRoles(): Promise<{ roles: ScreenRole[] }>
      popOutDetailedView(type: string, id?: string, options?: any): Promise<{
        success: boolean
        windowId?: number
        screen?: number
      }>
    }
  }
}
