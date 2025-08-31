# Theme Synchronization & Database Updates

## Overview

This document outlines the implementation of system-wide theme synchronization and the new database seed with fresh data for IBS 2025.

## 🎨 Theme Synchronization System

### Features

- **Cross-Window Synchronization**: Theme changes automatically propagate to all open windows and tabs
- **Multi-Screen Support**: Secondary screen windows automatically inherit the current theme
- **System Theme Detection**: Automatic detection and synchronization with system light/dark mode
- **Persistent Storage**: Theme preferences saved in localStorage and synchronized across sessions
- **Real-time Updates**: Instant theme changes across all connected windows

### Implementation Details

#### 1. Enhanced Theme Provider (`components/theme-provider.tsx`)

```typescript
// Supports three theme modes:
type Theme = "dark" | "light" | "system"

// Automatically broadcasts theme changes to all windows
window.postMessage({
  type: 'THEME_CHANGE',
  theme: theme
}, '*')
```

#### 2. Theme Toggle Component (`components/theme-toggle.tsx`)

- **Dropdown Menu**: Choose between Light, Dark, or System themes
- **Visual Indicators**: Dynamic icons that change based on current theme
- **Smooth Transitions**: Animated icon changes for better UX

#### 3. Theme Synchronization Hook (`hooks/use-theme-sync.tsx`)

```typescript
export function useThemeSync() {
  // Listens for theme changes from other windows
  // Handles system theme changes
  // Broadcasts current theme to other windows
}
```

#### 4. Multi-Screen Integration (`hooks/use-multi-screen.ts`)

```typescript
// When opening new windows, automatically send current theme
const currentTheme = localStorage.getItem('vite-ui-theme') || 'system'
newWindow.postMessage({
  type: 'THEME_CHANGE',
  theme: currentTheme
}, '*')
```

### How It Works

1. **Theme Change Detection**: User changes theme via toggle component
2. **Local Storage Update**: Theme preference saved to localStorage
3. **Cross-Window Broadcast**: `postMessage` API sends theme to all windows
4. **Automatic Application**: All windows receive and apply theme change
5. **System Theme Sync**: Automatic detection of system theme changes

### Usage

#### In Components
```typescript
import { useTheme } from '@/components/theme-provider'

export function MyComponent() {
  const { theme, setTheme } = useTheme()
  
  return (
    <div className={`theme-${theme}`}>
      {/* Component content */}
    </div>
  )
}
```

#### For Theme Synchronization
```typescript
import { useThemeSync } from '@/hooks/use-theme-sync'

export function MyComponent() {
  useThemeSync() // Automatically handles theme sync
  
  return <div>Content with synchronized theme</div>
}
```

## 🗄️ New Database Seed (IBS 2025)

### Fresh Data Structure

All data has been updated with new identifiers and realistic aviation information for 2025.

#### Alerts Collection
- **5 New Alerts**: Hurricane warnings, security breaches, operational issues
- **Unique IDs**: `alert_2025_001`, `alert_2025_002`, etc.
- **Realistic Scenarios**: Based on actual aviation operational challenges

#### Flights Collection
- **5 New Flights**: Various airlines, routes, and statuses
- **Unique IDs**: `flight_2025_001`, `flight_2025_002`, etc.
- **Comprehensive Data**: Includes crew, weather, fuel, and passenger information

#### Metrics Collection
- **10 New KPIs**: Performance indicators with targets and trends
- **Realistic Values**: Based on aviation industry benchmarks
- **Progress Tracking**: Includes target values for progress bars

#### Users Collection
- **3 New Users**: Admin, operator, and viewer roles
- **Secure Passwords**: Strong hashed passwords
- **Unique IDs**: `user_2025_001`, `user_2025_002`, etc.

#### Screens Collection
- **4 Screen Configurations**: Multi-monitor setups
- **Role Assignment**: General and detailed view roles
- **Realistic Resolutions**: 4K, 1080p, and multi-screen layouts

### New Login Credentials

```
🔑 Login Credentials:
   - admin2025 / ibs2025!
   - operator2025 / operator2025!
   - viewer2025 / viewer2025!
```

### Database Schema Updates

#### HistoricalMetrics
```javascript
// Updated structure
{
  time: String,      // ISO timestamp
  value: Number,     // Actual performance value
  target: Number     // Target performance value
}
```

#### Metrics
```javascript
// Enhanced structure
{
  kpi_name: String,      // Unique KPI identifier
  value: Number,         // Current value
  change: Number,        // Change from previous period
  percentage: Number,    // Percentage change
  isPositive: Boolean,   // Performance direction
  unit: String,          // Measurement unit
  target: Number,        // Target value (optional)
  lastUpdated: Date      // Last update timestamp
}
```

## 🚀 Getting Started

### 1. Update Database

```bash
cd data-services
npm run seed
```

### 2. Verify Theme Synchronization

1. Open the application in multiple windows/tabs
2. Change theme using the toggle in any window
3. Verify all windows automatically update
4. Test multi-screen functionality

### 3. Test New Data

1. Login with new credentials
2. Navigate to different sections
3. Verify fresh data is displayed
4. Check that all KPIs have proper values and targets

## 🔧 Technical Implementation

### Message Types

```typescript
// Theme synchronization
{
  type: 'THEME_CHANGE',
  theme: 'dark' | 'light' | 'system'
}

// Multi-screen data
{
  type: 'DETAILED_VIEW_DATA',
  viewType: 'flight' | 'alerts' | 'metrics' | 'operations',
  id: string,
  timestamp: number
}
```

### Event Listeners

- **Window Message**: Cross-window communication
- **Media Query**: System theme detection
- **Storage Events**: Theme preference changes

### Performance Considerations

- **Debounced Updates**: Prevents excessive theme broadcasts
- **Efficient DOM Updates**: Minimal re-renders during theme changes
- **Memory Management**: Proper cleanup of event listeners

## 🐛 Troubleshooting

### Theme Not Syncing

1. Check browser console for errors
2. Verify `postMessage` API support
3. Check localStorage permissions
4. Ensure ThemeSync component is mounted

### Database Issues

1. Verify MongoDB connection
2. Check environment variables
3. Run seed script with proper permissions
4. Clear existing data before seeding

### Multi-Screen Issues

1. Verify screen detection API support
2. Check window positioning parameters
3. Ensure proper role assignment
4. Verify theme message passing

## 🔮 Future Enhancements

- **Theme Presets**: Custom color schemes
- **User Preferences**: Individual theme settings
- **Advanced Sync**: Cross-device theme synchronization
- **Performance Metrics**: Theme change analytics
- **Accessibility**: High contrast and colorblind-friendly themes
