# Multi-Screen Feature Implementation Guide

## Overview

The Multi-Screen Feature in IBS_V5 enables the aviation dashboard to detect connected monitors, assign roles (general dashboard vs. detailed views), and intelligently place detailed flight information windows on appropriate screens. This feature is designed to enhance productivity for aviation operations staff using multi-monitor setups.

## Architecture

### Frontend Components
- **`useMultiScreen` Hook**: Manages screen detection, role assignment, and window placement
- **`RoleAssignmentModal`**: UI for assigning screen roles when multiple monitors are detected
- **`DetailedFlightView`**: Component for displaying comprehensive flight information
- **Enhanced Dashboard**: Main dashboard with integrated multi-screen functionality

### Backend Services
- **Screen Management API**: Endpoints for managing screen roles and coordinates
- **MongoDB Integration**: Storage for screen configurations and session data
- **Authentication**: JWT-based security for screen management

### Data Flow
1. **Detection**: Browser detects available screens using Window Management API
2. **Role Assignment**: User assigns roles (general/detailed) to each screen
3. **Configuration Storage**: Screen roles and coordinates stored in MongoDB
4. **Window Placement**: Detailed views automatically placed on designated detailed screens

## Implementation Details

### 1. Screen Detection

The system uses the modern `getScreenDetails()` API for multi-monitor detection:

```typescript
const detectScreens = async (): Promise<Screen[]> => {
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
      return detectedScreens
    } else {
      // Fallback for single screen
      return [{
        id: 0,
        left: 0,
        top: 0,
        width: window.screen.width,
        height: window.screen.height
      }]
    }
  } catch (error) {
    console.error('Failed to detect screens:', error)
    return fallbackScreens
  }
}
```

### 2. Role Assignment

Users can assign specific roles to each detected screen:

- **General Dashboard**: Main operational view with overview metrics, alerts, and flight tables
- **Detailed Views**: Dedicated screens for comprehensive flight information and analysis

```typescript
const assignRole = async (screenId: number, role: 'general' | 'detailed') => {
  const response = await fetch('http://localhost:3001/api/screens/role', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ sessionId, deviceId, screenId, role })
  })
  return response.ok
}
```

### 3. Window Placement

Detailed flight views are automatically positioned on screens assigned the "detailed" role:

```typescript
const popOutDetailedView = async (flightId: string) => {
  const detailedScreen = screens.find(screen => screen.id === 1)
  
  if (detailedScreen) {
    const { left, top, width, height } = detailedScreen
    const newWindow = window.open(
      `/detailed/${flightId}`,
      '_blank',
      `left=${left},top=${top},width=${width},height=${height}`
    )
    
    // Send flight ID to the new window
    newWindow.addEventListener('load', () => {
      newWindow.postMessage({ flightId }, '*')
    })
  }
}
```

### 4. Data Transfer

Flight information is transferred between windows using the `postMessage` API:

```typescript
// In detailed view component
useEffect(() => {
  const handleMessage = async (event: MessageEvent) => {
    if (event.data.flightId) {
      await loadFlightDetails(event.data.flightId)
    }
  }

  window.addEventListener("message", handleMessage)
  return () => window.removeEventListener("message", handleMessage)
}, [])
```

## API Endpoints

### Screen Management

#### POST `/api/screens/link`
Links a device to a session and stores screen coordinates.

**Request Body:**
```json
{
  "sessionId": "string",
  "deviceId": "string", 
  "screenId": "string",
  "left": "number",
  "top": "number",
  "width": "number",
  "height": "number"
}
```

#### POST `/api/screens/role`
Assigns a role to a specific screen.

**Request Body:**
```json
{
  "sessionId": "string",
  "deviceId": "string",
  "screenId": "string",
  "role": "general" | "detailed"
}
```

#### GET `/api/screens/session/:sessionId`
Retrieves all screens for a specific session.

#### GET `/api/screens/device/:deviceId/session/:sessionId`
Gets screen information for a specific device and session.

## Database Schema

### Screens Collection
```javascript
{
  sessionId: String,        // Unique session identifier
  deviceId: String,         // Device identifier
  screenId: String,         // Screen identifier (0, 1, 2, etc.)
  left: Number,             // Screen left position
  top: Number,              // Screen top position
  width: Number,            // Screen width
  height: Number,           // Screen height
  role: String,             // "general", "detailed", or "unassigned"
  createdAt: Date,          // Creation timestamp
  updatedAt: Date           // Last update timestamp
}
```

## User Experience

### Single Screen Setup
- Automatically assigned "general" role
- Detailed views open as modals or new tabs
- No role assignment prompt

### Multi-Screen Setup
1. **Detection**: System automatically detects multiple monitors
2. **Role Assignment**: Modal prompts user to assign roles to each screen
3. **Configuration**: Roles are saved and persist across sessions
4. **Optimization**: Detailed views automatically open on designated detailed screens

### Role Benefits

#### General Dashboard
- Overview metrics and KPIs
- Flight status tables
- System alerts and notifications
- Quick access to all operations

#### Detailed Views
- Comprehensive flight information
- Crew and passenger details
- Aircraft specifications
- Weather conditions
- Progress tracking

## Browser Compatibility

### Supported Browsers
- **Chrome 94+**: Full support with `getScreenDetails()` API
- **Edge 94+**: Full support with `getScreenDetails()` API
- **Firefox**: Limited support (fallback to single screen)
- **Safari**: Limited support (fallback to single screen)

### Fallback Behavior
For browsers without multi-screen support:
- Single screen detection
- Automatic "general" role assignment
- Detailed views open in new tabs/windows
- No functionality loss

## Security Considerations

### Authentication
- All screen management endpoints require valid JWT tokens
- Session-based access control
- Device ID validation

### Data Privacy
- Screen coordinates stored locally and in secure database
- No external sharing of monitor information
- Session-based data isolation

## Performance Optimization

### Lazy Loading
- Screen detection only when needed
- Role assignment on-demand
- Efficient window placement algorithms

### Caching
- Screen configurations cached in localStorage
- Session data cached for quick access
- Reduced API calls for repeated operations

## Troubleshooting

### Common Issues

#### Screen Detection Fails
- Check browser compatibility
- Ensure proper permissions
- Verify monitor connections

#### Role Assignment Issues
- Clear browser cache
- Check authentication token
- Verify database connectivity

#### Window Placement Problems
- Confirm screen coordinates
- Check browser popup blockers
- Verify detailed screen assignment

### Debug Mode
Enable debug logging for troubleshooting:

```typescript
// In development
console.log('Detected screens:', screens)
console.log('Current role:', currentRole)
console.log('Window placement:', { left, top, width, height })
```

## Future Enhancements

### Planned Features
- **Dynamic Role Switching**: Change screen roles without re-initialization
- **Layout Presets**: Predefined multi-screen configurations
- **Cross-Device Sync**: Synchronize screen roles across devices
- **Advanced Window Management**: Resize and reposition windows dynamically

### Integration Opportunities
- **Flight Planning Systems**: Dedicated planning screens
- **ATC Integration**: Real-time air traffic control displays
- **Maintenance Tracking**: Dedicated maintenance operation screens
- **Passenger Services**: Customer service and information displays

## Testing

### Test Scenarios
1. **Single Monitor**: Verify fallback behavior
2. **Dual Monitor**: Test role assignment and window placement
3. **Multiple Monitors**: Validate complex configurations
4. **Browser Compatibility**: Test across different browsers
5. **Error Handling**: Test network failures and edge cases

### Test Data
Use the provided seed data for consistent testing:
- Multiple screen configurations
- Various role assignments
- Different device and session combinations

## Deployment

### Prerequisites
- MongoDB database with updated schema
- Backend API with screen management endpoints
- Frontend with multi-screen components
- Modern browser support

### Configuration
- Set environment variables for database connection
- Configure CORS for multi-window communication
- Set up proper authentication middleware

### Monitoring
- Track screen detection success rates
- Monitor role assignment usage
- Log window placement accuracy
- Monitor API performance

## Conclusion

The Multi-Screen Feature significantly enhances the IBS_V5 aviation dashboard by providing intelligent monitor management and optimized workflow layouts. The implementation follows modern web standards while maintaining backward compatibility and robust error handling.

This feature is particularly valuable for aviation operations centers, control rooms, and multi-monitor workstations where efficient information display and workflow optimization are critical for operational success.
