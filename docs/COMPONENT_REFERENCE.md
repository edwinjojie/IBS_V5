# Component Reference Guide

This document provides detailed information about all components in the IBS v5 system, including their purpose, props, usage examples, and implementation details.

## Table of Contents
1. [Core Application Components](#core-application-components)
2. [UI Components](#ui-components)
3. [Feature Components](#feature-components)
4. [Utility Components](#utility-components)
5. [Component Patterns](#component-patterns)

## Core Application Components

### DashboardPage
**Location**: `app/dashboard/page.tsx`  
**Type**: Page Component  
**Purpose**: Main dashboard interface with tabbed navigation and real-time data display

**Key Features**:
- Tabbed navigation system
- Global search functionality
- Real-time metrics display
- Theme switching
- Responsive sidebar navigation

**State Management**:
```typescript
const [activeTab, setActiveTab] = useState('dashboard');
const [selectedPeriod, setSelectedPeriod] = useState('today');
const [searchQuery, setSearchQuery] = useState("");
const [metrics, setMetrics] = useState<any>(null);
const [flightStatusFilter, setFlightStatusFilter] = useState<FlightStatus | null>(null);
```

**Navigation Items**:
```typescript
const navigationItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "flights", label: "Flights", icon: Plane },
  { id: "weather", label: "Weather", icon: CloudSun },
  { id: "alerts", label: "Alerts", icon: Bell },
  { id: "support", label: "Support", icon: LifeBuoy },
  { id: "settings", label: "Settings", icon: Settings },
];
```

**Usage Example**:
```tsx
// This component is automatically rendered when navigating to /dashboard
// No props required - it's a page component
```

### LoginPage
**Location**: `app/login/page.tsx`  
**Type**: Page Component  
**Purpose**: User authentication interface

**Key Features**:
- Username/password authentication
- JWT token storage
- Error handling
- Responsive design with background image

**State Management**:
```typescript
const [username, setUsername] = useState("");
const [password, setPassword] = useState("");
const [loading, setLoading] = useState(false);
const [error, setError] = useState("");
```

**Authentication Flow**:
1. User submits credentials
2. POST request to `/api/login`
3. JWT token stored in localStorage
4. Redirect to dashboard on success

**Usage Example**:
```tsx
// Automatically rendered at /login route
// Handles authentication and redirects to dashboard
```

## Feature Components

### EnhancedFlightsTable
**Location**: `components/enhanced-flights-table.tsx`  
**Type**: Feature Component  
**Purpose**: Advanced flight management table with filtering and real-time updates

**Props Interface**:
```typescript
interface EnhancedFlightsTableProps {
  statusFilter?: Flight["status"] | "all" | null;
}
```

**Key Features**:
- Real-time flight data display
- Status-based filtering
- Search functionality
- Flight details modal
- Alert integration
- Responsive table design

**State Management**:
```typescript
const [flights, setFlights] = useState<Flight[]>([]);
const [alerts, setAlerts] = useState<Alert[]>([]);
const [loading, setLoading] = useState(true);
const [searchQuery, setSearchQuery] = useState("");
const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
```

**Flight Status Types**:
```typescript
type FlightStatus = "On Time" | "Delayed" | "Boarding" | "Departed" | "Cancelled";
```

**Usage Example**:
```tsx
// Basic usage
<EnhancedFlightsTable />

// With status filter
<EnhancedFlightsTable statusFilter="Delayed" />

// In dashboard context
<EnhancedFlightsTable statusFilter={flightStatusFilter} />
```

**Data Loading**:
```typescript
const loadData = async () => {
  setLoading(true);
  try {
    const token = localStorage.getItem("token");
    const [flightsResponse, alertsResponse] = await Promise.all([
      fetch("http://localhost:3001/api/flights", {
        headers: { Authorization: `Bearer ${token}` },
      }),
      fetch("http://localhost:3001/api/alerts", {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ]);
    const flightsData = await flightsResponse.json();
    const alertsData = await alertsResponse.json();
    setFlights(flightsData);
    setAlerts(alertsData);
  } catch (error) {
    console.error("Failed to load data:", error);
  } finally {
    setLoading(false);
  }
};
```

### EnhancedAlertsPanel
**Location**: `components/enhanced-alerts-panel.tsx`  
**Type**: Feature Component  
**Purpose**: Comprehensive alert management system with categorization and filtering

**Key Features**:
- Multi-tab organization
- Severity-based filtering
- Alert dismissal functionality
- Real-time updates
- Affected flights/airports display

**Alert Types**:
```typescript
type AlertType = "weather" | "security" | "delay" | "accident" | "operational" | "fuel" | "crew";
```

**Severity Levels**:
```typescript
type AlertSeverity = "critical" | "high" | "medium" | "low";
```

**Status Types**:
```typescript
type AlertStatus = "active" | "resolved" | "monitoring";
```

**State Management**:
```typescript
const [alerts, setAlerts] = useState<Alert[]>([]);
const [loading, setLoading] = useState(true);
const [activeTab, setActiveTab] = useState("all");
const [severityFilter, setSeverityFilter] = useState<string>("all");
```

**Usage Example**:
```tsx
// Basic usage
<EnhancedAlertsPanel />

// In dashboard alerts tab
{activeTab === "alerts" && (
  <div>
    <div className="mb-4">
      <h2 className="text-lg font-semibold text-foreground">System Alerts</h2>
      <p className="text-sm text-muted-foreground">Comprehensive operational alerts and notifications</p>
    </div>
    <EnhancedAlertsPanel />
  </div>
)}
```

### MetricsCard
**Location**: `components/metrics-card.tsx`  
**Type**: Display Component  
**Purpose**: Reusable metric display with change indicators and tooltips

**Props Interface**:
```typescript
interface MetricsCardProps {
  title: React.ReactNode;
  value: string;
  change?: {
    value: string;
    percentage: string;
    isPositive: boolean;
  };
  onClick?: () => void;
}
```

**Key Features**:
- Value display with units
- Change indicators (positive/negative)
- Percentage calculations
- Interactive tooltips
- Click handlers for navigation

**Usage Example**:
```tsx
// Basic metric card
<MetricsCard
  title="Flights Today"
  value="156"
  change={{
    value: "+12",
    percentage: "+8.3%",
    isPositive: true,
  }}
/>

// With click handler
<MetricsCard
  title="Delays"
  value="23"
  change={{
    value: "+5",
    percentage: "+27.8%",
    isPositive: false,
  }}
  onClick={() => {
    setActiveTab("flights");
    setFlightStatusFilter("Delayed");
  }}
/>

// With tooltip
<MetricsCard
  title={
    <span>
      OTP
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Info className="inline h-4 w-4 text-muted-foreground cursor-help" />
          </TooltipTrigger>
          <TooltipContent>On-Time Performance percentage</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </span>
  }
  value="85.2%"
  change={{
    value: "+2.1%",
    percentage: "+2.5%",
    isPositive: true,
  }}
/>
```

### OperationsChart
**Location**: `components/operations-chart.tsx`  
**Type**: Chart Component  
**Purpose**: Performance visualization with historical data

**Props Interface**:
```typescript
interface OperationsChartProps {
  selectedPeriod: string;
}
```

**Key Features**:
- Line chart visualization
- Time period selection
- Performance metrics display
- Responsive chart design

**Usage Example**:
```tsx
<OperationsChart selectedPeriod={selectedPeriod} />
```

### DashboardAlerts
**Location**: `components/dashboard-alerts.tsx`  
**Type**: Display Component  
**Purpose**: Critical alerts display for dashboard overview

**Props Interface**:
```typescript
interface DashboardAlertsProps {
  onViewAll: () => void;
}
```

**Key Features**:
- Critical alerts summary
- View all alerts button
- Real-time updates
- Compact display format

**Usage Example**:
```tsx
<DashboardAlerts onViewAll={() => setActiveTab("alerts")} />
```

## UI Components

The system uses a comprehensive set of UI components built on Radix UI primitives. These components are located in `components/ui/` and provide the foundation for all user interface elements.

### Form Components
- **Input**: Text input fields with validation support
- **Button**: Various button styles and variants
- **Select**: Dropdown selection components
- **Checkbox**: Checkbox inputs with labels
- **Textarea**: Multi-line text input

### Layout Components
- **Card**: Container components with various styles
- **Dialog**: Modal dialogs and overlays
- **Sheet**: Slide-out panels
- **Accordion**: Collapsible content sections
- **Tabs**: Tabbed content organization

### Navigation Components
- **Tabs**: Tab navigation system
- **Breadcrumb**: Navigation breadcrumbs
- **Navigation Menu**: Dropdown navigation menus
- **Sidebar**: Side navigation components

### Feedback Components
- **Toast**: Notification system
- **Alert**: Alert messages and warnings
- **Progress**: Progress indicators
- **Skeleton**: Loading placeholders

### Data Display Components
- **Table**: Data table components
- **Badge**: Status and label indicators
- **Avatar**: User profile images
- **Tooltip**: Hover information display

## Utility Components

### ThemeProvider
**Location**: `components/theme-provider.tsx`  
**Type**: Context Provider  
**Purpose**: Theme management and switching

**Features**:
- Dark/light theme support
- System theme detection
- Theme persistence
- Context-based state management

**Usage Example**:
```tsx
// In layout.tsx
<ThemeProvider defaultTheme="dark">
  {children}
</ThemeProvider>

// In components
const { theme, setTheme } = useTheme();
```

### ThemeToggle
**Location**: `components/theme-toggle.tsx`  
**Type**: Interactive Component  
**Purpose**: Theme switching button

**Features**:
- Theme toggle functionality
- Icon changes based on current theme
- Smooth transitions
- Accessible button design

**Usage Example**:
```tsx
<ThemeToggle />
```

## Component Patterns

### State Management Patterns

#### Local State with useState
```typescript
const [localState, setLocalState] = useState(initialValue);
```

#### Effect-based Data Loading
```typescript
useEffect(() => {
  const loadData = async () => {
    // Data loading logic
  };
  loadData();
}, [dependencies]);
```

#### Conditional Rendering
```tsx
{condition && <Component />}
{condition ? <ComponentA /> : <ComponentB />}
```

### Props Pattern

#### Optional Props with Default Values
```typescript
interface ComponentProps {
  required: string;
  optional?: string;
  callback?: () => void;
}

const Component = ({ required, optional = "default", callback }: ComponentProps) => {
  // Component logic
};
```

#### Children Props
```typescript
interface ContainerProps {
  children: React.ReactNode;
  className?: string;
}

const Container = ({ children, className }: ContainerProps) => (
  <div className={className}>{children}</div>
);
```

### Error Handling Patterns

#### Try-Catch in Async Functions
```typescript
const handleOperation = async () => {
  try {
    const result = await apiCall();
    setData(result);
  } catch (error) {
    setError(error.message);
  } finally {
    setLoading(false);
  }
};
```

#### Conditional Error Display
```tsx
{error && (
  <div className="text-red-500 text-sm">
    {error}
  </div>
)}
```

### Loading States

#### Loading Skeleton
```tsx
{loading ? (
  <Skeleton className="h-20 w-full" />
) : (
  <ActualContent />
)}
```

#### Loading Spinner
```tsx
<Button disabled={loading}>
  {loading ? (
    <RefreshCw className="h-4 w-4 animate-spin" />
  ) : (
    "Submit"
  )}
</Button>
```

## Best Practices

### Component Organization
1. **Single Responsibility**: Each component should have one clear purpose
2. **Props Interface**: Always define TypeScript interfaces for props
3. **Default Props**: Provide sensible defaults for optional props
4. **Error Boundaries**: Implement error boundaries for critical components

### Performance Optimization
1. **Memoization**: Use React.memo for expensive components
2. **Callback Optimization**: Use useCallback for event handlers
3. **Effect Dependencies**: Minimize useEffect dependencies
4. **Lazy Loading**: Implement lazy loading for large components

### Accessibility
1. **Semantic HTML**: Use appropriate HTML elements
2. **ARIA Labels**: Provide ARIA labels for interactive elements
3. **Keyboard Navigation**: Ensure keyboard accessibility
4. **Screen Reader Support**: Test with screen readers

### Testing
1. **Unit Tests**: Test individual component functionality
2. **Integration Tests**: Test component interactions
3. **Accessibility Tests**: Verify accessibility compliance
4. **Visual Regression**: Test visual consistency

---

*This component reference guide provides comprehensive information about all components in the IBS v5 system. For implementation details, refer to the actual component files in the codebase.*
