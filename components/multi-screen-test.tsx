"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Monitor } from 'lucide-react'

export function MultiScreenTest() {
  const [testResults, setTestResults] = useState<string[]>([])
  const [screens, setScreens] = useState<any[]>([])

  const addResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`])
  }

  const detectScreens = async () => {
    addResult("🔍 Starting screen detection...")
    
    try {
      if ('getScreenDetails' in window) {
        addResult("✅ getScreenDetails API is available")
        const screenDetails = await (window as any).getScreenDetails()
        const detectedScreens = screenDetails.screens.map((screen: any, index: number) => ({
          id: index,
          left: screen.left,
          top: screen.top,
          width: screen.width,
          height: screen.height,
          isPrimary: screen.isPrimary || false
        }))
        
        setScreens(detectedScreens)
        addResult(`✅ Detected ${detectedScreens.length} screens`)
        detectedScreens.forEach((screen, index) => {
          addResult(`   Screen ${index}: ${screen.width}x${screen.height} at (${screen.left}, ${screen.top}) ${screen.isPrimary ? '[PRIMARY]' : ''}`)
        })
        
        const currentScreen = screenDetails.currentScreen
        if (currentScreen) {
          addResult(`📍 Current screen: ${currentScreen.width}x${currentScreen.height} at (${currentScreen.left}, ${currentScreen.top})`)
        }
      } else {
        addResult("❌ getScreenDetails API not available - using fallback")
        
        const screenInfo = window.screen
        const fallbackScreens = [{
          id: 0,
          left: 0,
          top: 0,
          width: screenInfo.width,
          height: screenInfo.height,
          isPrimary: true
        }]
        
        // Try to detect if multiple screens exist
        if (screenInfo.availWidth > screenInfo.width * 1.2) {
          fallbackScreens.push({
            id: 1,
            left: screenInfo.width,
            top: 0,
            width: screenInfo.width,
            height: screenInfo.height,
            isPrimary: false
          })
          addResult("🔍 Detected likely multi-screen setup via fallback")
        }
        
        setScreens(fallbackScreens)
        addResult(`📺 Fallback detection: ${fallbackScreens.length} screens`)
      }
    } catch (error) {
      addResult(`❌ Screen detection failed: ${error}`)
    }
  }

  const testBasicWindowOpen = () => {
    addResult("🧪 Testing basic window.open()...")
    
    try {
      const testWindow = window.open('about:blank', 'basic-test', 'width=400,height=300')
      if (testWindow) {
        addResult("✅ Basic window.open() works")
        setTimeout(() => {
          if (testWindow && !testWindow.closed) {
            const x = testWindow.screenX || testWindow.screenLeft || 0
            const y = testWindow.screenY || testWindow.screenTop || 0
            addResult(`📍 Window opened at: (${x}, ${y})`)
            testWindow.close()
          }
        }, 1000)
      } else {
        addResult("❌ Basic window.open() failed - likely popup blocked")
        addResult("💡 Please disable popup blocker for this site")
      }
    } catch (error) {
      addResult(`❌ Basic window test error: ${error}`)
    }
  }

  const testPositionedWindow = (targetX: number, targetY: number, screenInfo?: string) => {
    addResult(`🎯 Testing positioned window at (${targetX}, ${targetY}) ${screenInfo || ''}`)
    
    try {
      const features = `left=${targetX},top=${targetY},width=500,height=400,scrollbars=yes,resizable=yes`
      const testWindow = window.open('about:blank', 'positioned-test', features)
      
      if (testWindow) {
        addResult("✅ Positioned window opened")
        
        setTimeout(() => {
          if (testWindow && !testWindow.closed) {
            const actualX = testWindow.screenX || testWindow.screenLeft || 0
            const actualY = testWindow.screenY || testWindow.screenTop || 0
            
            const deltaX = Math.abs(actualX - targetX)
            const deltaY = Math.abs(actualY - targetY)
            
            addResult(`📍 Expected: (${targetX}, ${targetY})`)
            addResult(`📍 Actual: (${actualX}, ${actualY})`)
            addResult(`📏 Offset: (${deltaX}, ${deltaY})`)
            
            if (deltaX < 50 && deltaY < 50) {
              addResult("✅ Window positioned correctly!")
            } else {
              addResult("⚠️ Window position differs from requested")
            }
            
            setTimeout(() => testWindow.close(), 2000)
          }
        }, 1000)
      } else {
        addResult("❌ Positioned window failed - popup likely blocked")
      }
    } catch (error) {
      addResult(`❌ Positioned window error: ${error}`)
    }
  }

  const testCrossScreenPositioning = () => {
    if (screens.length < 2) {
      addResult("❌ Need at least 2 screens for cross-screen test")
      return
    }

    const secondScreen = screens[1]
    const centerX = secondScreen.left + (secondScreen.width / 2) - 250 // Center a 500px wide window
    const centerY = secondScreen.top + (secondScreen.height / 2) - 200 // Center a 400px tall window
    
    addResult(`🚀 Testing cross-screen positioning to secondary screen`)
    addResult(`   Target screen: ${secondScreen.width}x${secondScreen.height} at (${secondScreen.left}, ${secondScreen.top})`)
    
    testPositionedWindow(centerX, centerY, '[SECONDARY SCREEN]')
  }

  const testMoveToMethod = () => {
    addResult("🔧 Testing moveTo() method...")
    
    if (screens.length < 2) {
      addResult("❌ Need at least 2 screens for moveTo test")
      return
    }

    try {
      const testWindow = window.open('about:blank', 'moveto-test', 'width=400,height=300')
      
      if (testWindow) {
        addResult("✅ Window opened, attempting moveTo()...")
        
        const secondScreen = screens[1]
        const targetX = secondScreen.left + 100
        const targetY = secondScreen.top + 100
        
        setTimeout(() => {
          if (testWindow && !testWindow.closed) {
            try {
              testWindow.moveTo(targetX, targetY)
              addResult(`🔧 moveTo(${targetX}, ${targetY}) called`)
              
              setTimeout(() => {
                if (testWindow && !testWindow.closed) {
                  const actualX = testWindow.screenX || testWindow.screenLeft || 0
                  const actualY = testWindow.screenY || testWindow.screenTop || 0
                  
                  addResult(`📍 Final position: (${actualX}, ${actualY})`)
                  
                  if (actualX >= secondScreen.left && actualX <= secondScreen.left + secondScreen.width &&
                      actualY >= secondScreen.top && actualY <= secondScreen.top + secondScreen.height) {
                    addResult("✅ SUCCESS: Window moved to secondary screen!")
                  } else {
                    addResult("❌ FAILED: Window did not move to secondary screen")
                  }
                  
                  setTimeout(() => testWindow.close(), 2000)
                }
              }, 1000)
            } catch (moveError) {
              addResult(`❌ moveTo() error: ${moveError}`)
              setTimeout(() => testWindow.close(), 1000)
            }
          }
        }, 500)
      } else {
        addResult("❌ Could not open window for moveTo test")
      }
    } catch (error) {
      addResult(`❌ moveTo test error: ${error}`)
    }
  }

  const testRealMultiScreenFlow = () => {
    addResult("🎭 Testing REAL multi-screen flow (simulating your pop-out button)...")
    
    if (screens.length < 2) {
      addResult("❌ Need at least 2 screens for real test")
      return
    }

    // Simulate the exact flow your system uses
    const detailedScreen = screens.find(screen => screen.id === 1) || screens[1]
    const windowWidth = Math.max(800, Math.min(detailedScreen.width * 0.8, 1600))
    const windowHeight = Math.max(600, Math.min(detailedScreen.height * 0.8, 1200))
    const windowLeft = detailedScreen.left + (detailedScreen.width - windowWidth) / 2
    const windowTop = detailedScreen.top + (detailedScreen.height - windowHeight) / 2

    addResult(`🎯 Simulating your exact flow:`)
    addResult(`   Target screen: Screen ${detailedScreen.id} at (${detailedScreen.left}, ${detailedScreen.top})`)
    addResult(`   Window size: ${windowWidth}x${windowHeight}`)
    addResult(`   Window position: (${Math.round(windowLeft)}, ${Math.round(windowTop)})`)

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
      const newWindow = window.open('/detailed/alerts', 'real-test', features)
      
      if (newWindow) {
        addResult("✅ Window opened with your exact parameters")
        
        setTimeout(() => {
          if (newWindow && !newWindow.closed) {
            const actualX = newWindow.screenX || newWindow.screenLeft || 0
            const actualY = newWindow.screenY || newWindow.screenTop || 0
            
            const onTargetScreen = actualX >= detailedScreen.left && 
                                 actualX <= (detailedScreen.left + detailedScreen.width) && 
                                 actualY >= detailedScreen.top && 
                                 actualY <= (detailedScreen.top + detailedScreen.height)
            
            addResult(`📍 Expected: (${Math.round(windowLeft)}, ${Math.round(windowTop)})`)
            addResult(`📍 Actual: (${actualX}, ${actualY})`)
            
            if (onTargetScreen) {
              addResult("🎉 SUCCESS! Window opened on secondary screen!")
              addResult("🎯 Your pop-out button WILL WORK!")
            } else {
              addResult("❌ FAILED: Window opened on wrong screen")
              addResult("⚠️ Your pop-out button may not work as expected")
            }
            
            setTimeout(() => newWindow.close(), 3000)
          }
        }, 1000)
      } else {
        addResult("❌ Window failed to open - popup blocker active")
        addResult("💡 Please allow popups for this site to test properly")
      }
    } catch (error) {
      addResult(`❌ Real test error: ${error}`)
    }
  }

  const clearResults = () => {
    setTestResults([])
  }

  const checkBrowserSupport = () => {
    addResult("🔍 Checking browser capabilities...")
    addResult(`🌐 User Agent: ${navigator.userAgent}`)
    addResult(`📊 Screen: ${window.screen.width}x${window.screen.height}`)
    addResult(`📐 Available: ${window.screen.availWidth}x${window.screen.availHeight}`)
    addResult(`🔧 getScreenDetails: ${'getScreenDetails' in window ? '✅ Available' : '❌ Not Available'}`)
    
    // Check popup blocker
    try {
      const popup = window.open('', 'popup-test', 'width=1,height=1')
      if (popup) {
        popup.close()
        addResult("✅ Popups allowed")
      } else {
        addResult("❌ Popup blocker is active")
      }
    } catch {
      addResult("❌ Popup blocker is active")
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Monitor className="h-5 w-5" />
          Multi-Screen Reality Test
          <Badge variant="outline">Live Testing</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Control Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <Button onClick={checkBrowserSupport} variant="outline" size="sm">
            🔍 Check Browser
          </Button>
          <Button onClick={detectScreens} variant="outline" size="sm">
            📺 Detect Screens  
          </Button>
          <Button onClick={testBasicWindowOpen} variant="outline" size="sm">
            🧪 Test Basic Open
          </Button>
          <Button onClick={clearResults} variant="outline" size="sm">
            🗑️ Clear Results
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <Button 
            onClick={() => testPositionedWindow(200, 200)} 
            variant="secondary" 
            size="sm"
            disabled={screens.length === 0}
          >
            🎯 Test Positioning
          </Button>
          <Button 
            onClick={testCrossScreenPositioning} 
            variant="secondary" 
            size="sm"
            disabled={screens.length < 2}
          >
            🚀 Test Cross-Screen
          </Button>
          <Button 
            onClick={testMoveToMethod} 
            variant="secondary" 
            size="sm"
            disabled={screens.length < 2}
          >
            🔧 Test moveTo()
          </Button>
        </div>

        <Button 
          onClick={testRealMultiScreenFlow} 
          variant="default" 
          className="w-full"
          disabled={screens.length < 2}
        >
          🎭 TEST YOUR EXACT POP-OUT FLOW
        </Button>

        {/* Screen Info */}
        {screens.length > 0 && (
          <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded">
            <h4 className="font-semibold mb-2">Detected Screens:</h4>
            {screens.map((screen, index) => (
              <div key={index} className="text-sm font-mono">
                Screen {index}: {screen.width}×{screen.height} at ({screen.left}, {screen.top}) {screen.isPrimary ? '[PRIMARY]' : ''}
              </div>
            ))}
          </div>
        )}

        {/* Test Results */}
        <div className="bg-black text-green-400 p-4 rounded font-mono text-sm max-h-80 overflow-y-auto">
          <div className="font-bold mb-2">🧪 Live Test Results:</div>
          {testResults.length === 0 ? (
            <div className="text-gray-500">Click buttons above to test multi-screen functionality...</div>
          ) : (
            testResults.map((result, index) => (
              <div key={index} className="py-0.5">
                {result}
              </div>
            ))
          )}
        </div>

        <div className="text-sm text-gray-600 dark:text-gray-400 bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded">
          <strong>🚨 Important:</strong> Multi-screen window positioning success depends on:
          <ul className="mt-2 ml-4 space-y-1">
            <li>• Browser type and version (Chrome/Edge work best)</li>
            <li>• Popup blocker settings (must be disabled)</li>
            <li>• Operating system permissions</li>
            <li>• Hardware setup and screen arrangement</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
