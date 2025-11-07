"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useMultiScreen } from '@/hooks/use-multi-screen'

export function MultiScreenDebug() {
  const [debugInfo, setDebugInfo] = useState<any>({})
  const [testResults, setTestResults] = useState<string[]>([])
  
  const {
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
  } = useMultiScreen()

  const runDiagnostics = async () => {
    const results: string[] = []
    
    try {
      // Test 1: Check multi-screen support
      if (isMultiScreenSupported()) {
        results.push('✅ Multi-screen API supported')
      } else {
        results.push('❌ Multi-screen API not supported')
      }

      // Test 2: Check screen detection
      if (screens.length > 0) {
        results.push(`✅ ${screens.length} screen(s) detected`)
        screens.forEach((screen, index) => {
          results.push(`   Screen ${index}: ${screen.width}x${screen.height} at (${screen.left}, ${screen.top})`)
        })
      } else {
        results.push('❌ No screens detected')
      }

      // Test 3: Check initialization
      if (isInitialized) {
        results.push('✅ Multi-screen initialized')
      } else {
        results.push('❌ Multi-screen not initialized')
      }

      // Test 4: Check current role
      if (currentRole) {
        results.push(`✅ Current role: ${currentRole}`)
      } else {
        results.push('❌ No role assigned')
      }

      // Test 5: Check device and session IDs
      if (deviceId) {
        results.push(`✅ Device ID: ${deviceId.substring(0, 8)}...`)
      } else {
        results.push('❌ No device ID')
      }

      if (sessionId) {
        results.push(`✅ Session ID: ${sessionId.substring(0, 8)}...`)
      } else {
        results.push('❌ No session ID')
      }

      // Test 6: Window opening capabilities
      testWindowOpening()

    } catch (error) {
      results.push(`❌ Diagnostic error: ${error}`)
    }

    setTestResults(results)
  }

  const testDetailedView = async (type: 'alerts' | 'metrics' | 'operations') => {
    try {
      console.log(`Testing detailed view: ${type}`)
      await popOutDetailedView(type, undefined, {
        layout: 'grid',
        totalSlots: 4,
        // Leave slotIndex undefined to auto-cycle across slots
        paddingPx: 16
      })
      setTestResults(prev => [...prev, `✅ Tested ${type} detailed view`])
    } catch (error) {
      setTestResults(prev => [...prev, `❌ Failed to test ${type}: ${error}`])
    }
  }

  const forceInitialize = async () => {
    try {
      const result = await initializeMultiScreen()
      console.log('Initialization result:', result)
      setTestResults(prev => [...prev, `✅ Initialization: ${JSON.stringify(result)}`])
    } catch (error) {
      setTestResults(prev => [...prev, `❌ Initialization failed: ${error}`])
    }
  }

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🔧 Multi-Screen Debug Panel
          <Badge variant={isMultiScreenSupported() ? "default" : "destructive"}>
            {isMultiScreenSupported() ? "Supported" : "Not Supported"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Control Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button onClick={runDiagnostics} variant="outline">
            🧪 Run Diagnostics
          </Button>
          <Button onClick={forceInitialize} variant="outline">
            🚀 Force Initialize
          </Button>
          <Button onClick={detectScreens} variant="outline">
            📺 Detect Screens
          </Button>
          <Button onClick={testWindowOpening} variant="outline">
            🪟 Test Windows
          </Button>
        </div>

        {/* Test Detailed Views */}
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => testDetailedView('alerts')} variant="secondary" size="sm">
            Test Alerts View
          </Button>
          <Button onClick={() => testDetailedView('metrics')} variant="secondary" size="sm">
            Test Metrics View
          </Button>
          <Button onClick={() => testDetailedView('operations')} variant="secondary" size="sm">
            Test Operations View
          </Button>
        </div>

        {/* Current Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="font-semibold">Current Status</h4>
            <div className="text-sm space-y-1">
              <div>Initialized: <Badge variant={isInitialized ? "default" : "secondary"}>{isInitialized ? "Yes" : "No"}</Badge></div>
              <div>Current Role: <Badge variant="outline">{currentRole || "None"}</Badge></div>
              <div>Screens Detected: <Badge variant="outline">{screens.length}</Badge></div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold">Screen Details</h4>
            <div className="text-sm space-y-1">
              {screens.map((screen, index) => (
                <div key={index}>
                  Screen {index}: {screen.width}×{screen.height} at ({screen.left}, {screen.top})
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Test Results */}
        {testResults.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold">Test Results</h4>
            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md max-h-60 overflow-y-auto">
              {testResults.map((result, index) => (
                <div key={index} className="text-sm font-mono">
                  {result}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Debug Info */}
        <div className="space-y-2">
          <h4 className="font-semibold">Debug Information</h4>
          <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
            <pre className="text-xs overflow-x-auto">
              {JSON.stringify({
                deviceId: deviceId?.substring(0, 16) + '...',
                sessionId: sessionId?.substring(0, 16) + '...',
                screens: screens,
                currentRole,
                isInitialized,
                userAgent: navigator.userAgent,
                screenInfo: {
                  width: window.screen.width,
                  height: window.screen.height,
                  availWidth: window.screen.availWidth,
                  availHeight: window.screen.availHeight
                }
              }, null, 2)}
            </pre>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
