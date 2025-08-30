# Technical Architecture Documentation

This document provides detailed technical information about the IBS v5 system architecture, including design patterns, data flow, security implementation, and technical decisions.

## Table of Contents
1. [System Architecture Overview](#system-architecture-overview)
2. [Frontend Architecture](#frontend-architecture)
3. [Backend Architecture](#backend-architecture)
4. [Database Design](#database-design)
5. [API Design](#api-design)
6. [Security Implementation](#security-implementation)
7. [Performance Considerations](#performance-considerations)
8. [Error Handling](#error-handling)
9. [Testing Strategy](#testing-strategy)
10. [Deployment Architecture](#deployment-architecture)

## System Architecture Overview

### High-Level Architecture
```
┌─────────────────────────────────────────────────────────────────┐
│                        Client Layer                            │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   Web Browser   │  │   Mobile Web    │  │   Desktop App   │ │
│  │   (Chrome, FF)  │  │   (Responsive)  │  │   (Electron)    │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Presentation Layer                          │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   Next.js App   │  │   React 18      │  │   TypeScript    │ │
│  │   (App Router)  │  │   Components    │  │   Type Safety   │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API Gateway Layer                          │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   Express.js    │  │   REST API      │  │   CORS          │ │
│  │   Server        │  │   Endpoints     │  │   Middleware    │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Business Logic Layer                        │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   Authentication│  │   Flight Mgmt   │  │   Alert System  │ │
│  │   JWT + bcrypt  │  │   Operations    │  │   Monitoring    │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Data Access Layer                          │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   Mongoose ODM  │  │   MongoDB       │  │   Data Models   │ │
│  │   Schema        │  │   Collections   │  │   Indexes       │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### Architecture Principles
1. **Separation of Concerns**: Clear boundaries between layers
2. **Single Responsibility**: Each component has one clear purpose
3. **Dependency Inversion**: High-level modules don't depend on low-level modules
4. **Open/Closed Principle**: Open for extension, closed for modification
5. **Interface Segregation**: Clients don't depend on interfaces they don't use

## Frontend Architecture

### Next.js 15 App Router Structure
```
app/
├── layout.tsx              # Root layout with providers
├── page.tsx                # Home page (redirects to login)
├── globals.css             # Global styles and CSS variables
├── loading.tsx             # Loading state component
├── login/
│   └── page.tsx            # Authentication page
└── dashboard/
    └── page.tsx            # Main dashboard interface
```

### Component Architecture

#### Component Hierarchy
```
App (RootLayout)
├── ThemeProvider
│   └── DashboardPage
│       ├── Sidebar
│       │   ├── Navigation
│       │   ├── Search
│       │   └── ThemeToggle
│       └── MainContent
│           ├── Header
│           ├── MetricsGrid
│           ├── ChartsSection
│           └── TabContent
│               ├── DashboardTab
│               ├── FlightsTab
│               ├── AlertsTab
│               └── OtherTabs
```

#### Component Patterns

**Container Components** (Smart Components)
- Manage state and business logic
- Handle data fetching and side effects
- Pass data down to presentational components

**Presentational Components** (Dumb Components)
- Receive data via props
- Handle UI rendering and user interactions
- No direct state management or side effects

**Example Container Component**:
```typescript
// DashboardPage - Container Component
export default function DashboardPage() {
  const [metrics, setMetrics] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  useEffect(() => {
    loadMetrics();
  }, []);
  
  const loadMetrics = async () => {
    // Data fetching logic
  };
  
  return (
    <div>
      <MetricsGrid metrics={metrics} />
      <TabContent activeTab={activeTab} />
    </div>
  );
}
```

**Example Presentational Component**:
```typescript
// MetricsCard - Presentational Component
interface MetricsCardProps {
  title: string;
  value: string;
  change?: ChangeData;
  onClick?: () => void;
}

export function MetricsCard({ title, value, change, onClick }: MetricsCardProps) {
  return (
    <Card onClick={onClick}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change && <ChangeIndicator {...change} />}
      </CardContent>
    </Card>
  );
}
```

### State Management Architecture

#### Local State Management
```typescript
// Component-level state
const [localState, setLocalState] = useState(initialValue);

// Form state
const [formData, setFormData] = useState({
  username: '',
  password: ''
});

// Loading states
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
```

#### Context-based State Management
```typescript
// Theme Context
interface ThemeContextType {
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children, defaultTheme }: ThemeProviderProps) {
  const [theme, setTheme] = useState(defaultTheme);
  
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
```

#### Custom Hooks for State Logic
```typescript
// Custom hook for API data
export function useApiData<T>(endpoint: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    fetchData();
  }, [endpoint]);
  
  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch(endpoint);
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  return { data, loading, error, refetch: fetchData };
}
```

### Styling Architecture

#### Tailwind CSS Configuration
```typescript
// tailwind.config.ts
const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        // ... other color variables
      },
      // ... other theme extensions
    }
  }
};
```

#### CSS Variables for Theming
```css
/* globals.css */
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --card: 0 0% 100%;
  --card-foreground: 222.2 84% 4.9%;
  /* ... other light theme variables */
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --card: 222.2 84% 4.9%;
  --card-foreground: 210 40% 98%;
  /* ... other dark theme variables */
}
```

#### Component Styling Patterns
```typescript
// Utility-first approach with Tailwind
<div className="flex items-center justify-between p-4 bg-background border border-border rounded-lg">
  <h2 className="text-lg font-semibold text-foreground">Title</h2>
  <Button variant="outline" size="sm">Action</Button>
</div>

// Conditional styling
<div className={cn(
  "p-4 rounded-lg",
  isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
)}>
  Content
</div>
```

## Backend Architecture

### Express.js Server Structure
```javascript
// data-services/index.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
mongoose.connect(process.env.MONGODB_URI);

// Route organization
app.post('/api/login', loginHandler);
app.get('/api/verify', verifyToken, verifyHandler);
app.get('/api/flights', verifyToken, flightsHandler);
app.get('/api/alerts', verifyToken, alertsHandler);
app.get('/api/metrics', verifyToken, metricsHandler);
```

### Middleware Architecture

#### Authentication Middleware
```javascript
const verifyToken = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token" });
  }
  
  const token = auth.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};
```

#### Error Handling Middleware
```javascript
// Global error handler
app.use((error, req, res, next) => {
  console.error('Error:', error);
  
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      details: error.message
    });
  }
  
  if (error.name === 'MongoError') {
    return res.status(500).json({
      error: 'Database Error',
      details: 'An error occurred while accessing the database'
    });
  }
  
  res.status(500).json({
    error: 'Internal Server Error',
    details: 'An unexpected error occurred'
  });
});
```

#### CORS Configuration
```javascript
// CORS configuration for development
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://yourdomain.com'] 
    : ['http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### Route Organization

#### RESTful API Design
```javascript
// Flight routes
app.get('/api/flights', verifyToken, getAllFlights);
app.get('/api/flights/:id', verifyToken, getFlightById);
app.get('/api/flights/status/:status', verifyToken, getFlightsByStatus);
app.get('/api/flights/search', verifyToken, searchFlights);
app.get('/api/flights/airport/:airport', verifyToken, getFlightsByAirport);

// Alert routes
app.get('/api/alerts', verifyToken, getAllAlerts);
app.get('/api/alerts/active', verifyToken, getActiveAlerts);
app.get('/api/alerts/type/:type', verifyToken, getAlertsByType);
app.get('/api/alerts/severity/:severity', verifyToken, getAlertsBySeverity);

// Metrics routes
app.get('/api/metrics', verifyToken, getMetrics);
app.get('/api/historical-metrics', verifyToken, getHistoricalMetrics);
```

#### Route Handler Functions
```javascript
// Example route handler
const getAllFlights = async (req, res) => {
  try {
    const flights = await Flights.find();
    res.json(flights);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Search handler with query parameters
const searchFlights = async (req, res) => {
  try {
    const query = req.query.q ? req.query.q.toLowerCase() : '';
    const flights = await Flights.find({
      $or: [
        { flight: { $regex: query, $options: 'i' } },
        { airline: { $regex: query, $options: 'i' } },
        { route: { $regex: query, $options: 'i' } },
        { aircraft: { $regex: query, $options: 'i' } }
      ]
    });
    res.json(flights);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
```

## Database Design

### MongoDB Schema Design

#### Flights Collection
```javascript
const FlightsSchema = new Schema({
  id: { type: String, required: true, unique: true },
  flight: { type: String, required: true },
  airline: { type: String, required: true },
  route: { type: String, required: true },
  origin: { type: String, required: true },
  destination: { type: String, required: true },
  status: { 
    type: String, 
    required: true,
    enum: ['On Time', 'Delayed', 'Boarding', 'Departed', 'Cancelled']
  },
  scheduled: { type: String, required: true },
  actual: { type: String },
  estimatedArrival: { type: String },
  progress: { type: Number, min: 0, max: 100 },
  priority: { 
    type: String, 
    enum: ['high', 'medium', 'low'] 
  },
  aircraft: { type: String },
  registration: { type: String },
  passengers: { type: Number, min: 0 },
  capacity: { type: Number, min: 0 },
  gate: { type: String },
  terminal: { type: String },
  crew: {
    captain: { type: String },
    firstOfficer: { type: String }
  },
  weather: { type: String },
  fuel: { type: Number, min: 0 },
  lastUpdate: { type: Date, default: Date.now }
}, { 
  collection: 'Flights',
  timestamps: true 
});
```

#### Alerts Collection
```javascript
const AlertsSchema = new Schema({
  id: { type: String, required: true, unique: true },
  type: { 
    type: String, 
    required: true,
    enum: ['weather', 'security', 'delay', 'accident', 'operational', 'fuel', 'crew']
  },
  severity: { 
    type: String, 
    required: true,
    enum: ['critical', 'high', 'medium', 'low']
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  affectedAirports: [{ type: String }],
  affectedFlights: [{ type: String }],
  timestamp: { type: Date, required: true, default: Date.now },
  status: { 
    type: String, 
    required: true,
    enum: ['active', 'resolved', 'monitoring'],
    default: 'active'
  },
  source: { type: String, required: true },
  details: { type: Schema.Types.Mixed }
}, { 
  collection: 'Alerts',
  timestamps: true 
});
```

### Indexing Strategy

#### Performance Indexes
```javascript
// Single field indexes
FlightsSchema.index({ flight: 1 });
FlightsSchema.index({ status: 1 });
FlightsSchema.index({ airline: 1 });
FlightsSchema.index({ lastUpdate: -1 });

// Compound indexes for common queries
FlightsSchema.index({ status: 1, lastUpdate: -1 });
FlightsSchema.index({ origin: 1, destination: 1 });
FlightsSchema.index({ airline: 1, status: 1 });

// Text search indexes
FlightsSchema.index({ 
  flight: 'text', 
  airline: 'text', 
  route: 'text' 
});

// Alert indexes
AlertsSchema.index({ severity: 1, timestamp: -1 });
AlertsSchema.index({ type: 1, status: 1 });
AlertsSchema.index({ affectedFlights: 1 });
```

#### Index Optimization
```javascript
// Create indexes in background for production
FlightsSchema.index({ flight: 1 }, { background: true });
AlertsSchema.index({ severity: 1, timestamp: -1 }, { background: true });

// Sparse indexes for optional fields
FlightsSchema.index({ gate: 1 }, { sparse: true });
FlightsSchema.index({ terminal: 1 }, { sparse: true });
```

### Data Relationships

#### Referential Integrity
```javascript
// Virtual population for related data
FlightsSchema.virtual('relatedAlerts', {
  ref: 'Alerts',
  localField: 'flight',
  foreignField: 'affectedFlights'
});

// Pre-save middleware for data validation
FlightsSchema.pre('save', function(next) {
  if (this.passengers > this.capacity) {
    return next(new Error('Passengers cannot exceed capacity'));
  }
  next();
});
```

## API Design

### RESTful API Principles

#### Resource-Based URLs
```
GET    /api/flights          # List all flights
GET    /api/flights/:id      # Get specific flight
POST   /api/flights          # Create new flight
PUT    /api/flights/:id      # Update flight
DELETE /api/flights/:id      # Delete flight

GET    /api/alerts           # List all alerts
GET    /api/alerts/active    # List active alerts
GET    /api/alerts/type/:type # Filter by type
```

#### Query Parameters
```
GET /api/flights?status=delayed&airline=airline1
GET /api/flights?limit=50&offset=100
GET /api/alerts?severity=critical&limit=10
```

#### Response Format
```javascript
// Success response
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 150,
    "pages": 3
  }
}

// Error response
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [...]
  }
}
```

### API Versioning Strategy
```javascript
// Version prefix in URL
app.use('/api/v1', v1Routes);

// Content-Type versioning
app.use('/api', (req, res, next) => {
  const version = req.headers['accept-version'] || '1.0';
  req.apiVersion = version;
  next();
});
```

### Rate Limiting
```javascript
const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  }
});

app.use('/api/', apiLimiter);
```

## Security Implementation

### Authentication System

#### JWT Token Structure
```javascript
// Token payload
const payload = {
  userId: user.userId,
  username: user.username,
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + (2 * 60 * 60) // 2 hours
};

// Token generation
const token = jwt.sign(payload, JWT_SECRET, { 
  algorithm: 'HS256',
  expiresIn: '2h'
});
```

#### Password Security
```javascript
// Password hashing
const saltRounds = 12;
const passwordHash = await bcrypt.hash(password, saltRounds);

// Password verification
const isValid = await bcrypt.compare(password, user.passwordHash);
```

#### Session Management
```javascript
// Session creation
const session = new Sessions({
  sessionId: generateSessionId(),
  userId: user.userId,
  deviceId: req.headers['user-agent'],
  expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000) // 2 hours
});

// Session validation
const session = await Sessions.findOne({
  sessionId: req.headers.authorization?.split(' ')[1],
  expiresAt: { $gt: new Date() }
});
```

### Authorization System

#### Role-Based Access Control
```javascript
// User roles
const USER_ROLES = {
  ADMIN: 'admin',
  OPERATOR: 'operator',
  VIEWER: 'viewer'
};

// Permission middleware
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Insufficient permissions' 
      });
    }
    next();
  };
};

// Usage
app.get('/api/admin/users', 
  verifyToken, 
  requireRole([USER_ROLES.ADMIN]), 
  getUsers
);
```

#### Resource-Level Permissions
```javascript
// Check if user can access specific resource
const canAccessFlight = async (userId, flightId) => {
  const user = await Users.findById(userId);
  const flight = await Flights.findById(flightId);
  
  // Admin can access all flights
  if (user.role === USER_ROLES.ADMIN) return true;
  
  // Operator can access flights in their assigned airports
  if (user.role === USER_ROLES.OPERATOR) {
    return user.assignedAirports.includes(flight.origin) ||
           user.assignedAirports.includes(flight.destination);
  }
  
  return false;
};
```

### Input Validation and Sanitization

#### Request Validation
```javascript
const { body, validationResult } = require('express-validator');

const validateFlight = [
  body('flight').isString().trim().isLength({ min: 3, max: 10 }),
  body('airline').isString().trim().isLength({ min: 2, max: 50 }),
  body('route').isString().trim().isLength({ min: 5, max: 100 }),
  body('status').isIn(['On Time', 'Delayed', 'Boarding', 'Departed', 'Cancelled']),
  body('scheduled').isISO8601().toDate(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }
    next();
  }
];
```

#### SQL Injection Prevention
```javascript
// MongoDB ODM automatically prevents injection
// Use parameterized queries
const flight = await Flights.findOne({ id: flightId });

// Avoid string concatenation
// ❌ Bad
const query = `{ flight: "${req.query.flight}" }`;
const flights = await Flights.find(JSON.parse(query));

// ✅ Good
const flights = await Flights.find({ 
  flight: req.query.flight 
});
```

## Performance Considerations

### Frontend Performance

#### Code Splitting
```typescript
// Dynamic imports for route-based code splitting
const DashboardPage = lazy(() => import('./dashboard/page'));
const AlertsPage = lazy(() => import('./alerts/page'));

// Component-level lazy loading
const HeavyChart = lazy(() => import('./components/heavy-chart'));
```

#### Bundle Optimization
```typescript
// Tree shaking for unused imports
import { Button } from '@/components/ui/button';
// Instead of: import * as UI from '@/components/ui';

// Dynamic imports for large libraries
const Chart = dynamic(() => import('recharts'), {
  loading: () => <Skeleton className="h-64 w-full" />,
  ssr: false
});
```

#### Image Optimization
```typescript
// Next.js Image component for automatic optimization
import Image from 'next/image';

<Image
  src="/images/plane1.jpg"
  alt="Airplane"
  width={400}
  height={300}
  priority={true}
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
/>
```

### Backend Performance

#### Database Query Optimization
```javascript
// Use projection to limit returned fields
const flights = await Flights.find(
  { status: 'Delayed' },
  { flight: 1, airline: 1, route: 1, status: 1 }
);

// Use aggregation for complex queries
const metrics = await Flights.aggregate([
  { $match: { status: { $ne: 'Cancelled' } } },
  { $group: { 
    _id: '$status', 
    count: { $sum: 1 },
    avgDelay: { $avg: '$delay' }
  }},
  { $sort: { count: -1 } }
]);

// Use cursor for large result sets
const cursor = Flights.find({}).cursor();
for (let flight = await cursor.next(); flight != null; flight = await cursor.next()) {
  // Process flight
}
```

#### Caching Strategy
```javascript
// Redis caching for frequently accessed data
const redis = require('redis');
const client = redis.createClient();

const getCachedMetrics = async (key) => {
  const cached = await client.get(key);
  if (cached) {
    return JSON.parse(cached);
  }
  
  const data = await Metrics.find();
  await client.setex(key, 300, JSON.stringify(data)); // 5 minutes TTL
  return data;
};
```

#### Connection Pooling
```javascript
// MongoDB connection with connection pooling
mongoose.connect(process.env.MONGODB_URI, {
  maxPoolSize: 10,
  minPoolSize: 2,
  maxIdleTimeMS: 30000,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
});
```

### API Performance

#### Response Compression
```javascript
const compression = require('compression');

// Enable gzip compression
app.use(compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
  level: 6
}));
```

#### Response Caching
```javascript
// Cache static responses
app.use('/api/metrics', (req, res, next) => {
  res.set('Cache-Control', 'public, max-age=300'); // 5 minutes
  next();
});

// ETag support for conditional requests
app.use('/api/flights', (req, res, next) => {
  const etag = generateETag(req.url);
  if (req.headers['if-none-match'] === etag) {
    return res.status(304).send();
  }
  res.set('ETag', etag);
  next();
});
```

## Error Handling

### Frontend Error Handling

#### Error Boundaries
```typescript
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    // Log to error reporting service
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>Something went wrong</h2>
          <button onClick={() => window.location.reload()}>
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

#### API Error Handling
```typescript
const handleApiCall = async () => {
  try {
    setLoading(true);
    setError(null);
    
    const response = await fetch('/api/endpoint');
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'API request failed');
    }
    
    const data = await response.json();
    setData(data);
  } catch (err) {
    setError(err.message);
    // Show user-friendly error message
    toast.error(err.message);
  } finally {
    setLoading(false);
  }
};
```

### Backend Error Handling

#### Global Error Handler
```javascript
// Centralized error handling
app.use((error, req, res, next) => {
  // Log error for debugging
  console.error('Error:', {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    user: req.user?.userId,
    timestamp: new Date().toISOString()
  });

  // Determine error type and respond appropriately
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid input data',
        details: error.message
      }
    });
  }

  if (error.name === 'MongoError' && error.code === 11000) {
    return res.status(409).json({
      success: false,
      error: {
        code: 'DUPLICATE_KEY',
        message: 'Resource already exists'
      }
    });
  }

  // Default error response
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred'
    }
  });
});
```

#### Async Error Handling
```javascript
// Wrapper for async route handlers
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Usage
app.get('/api/flights', verifyToken, asyncHandler(async (req, res) => {
  const flights = await Flights.find();
  res.json(flights);
}));
```

## Testing Strategy

### Frontend Testing

#### Unit Testing with Jest
```typescript
// Component testing
import { render, screen, fireEvent } from '@testing-library/react';
import { MetricsCard } from './metrics-card';

describe('MetricsCard', () => {
  it('renders title and value correctly', () => {
    render(
      <MetricsCard
        title="Test Metric"
        value="100"
        change={{ value: "+10", percentage: "+10%", isPositive: true }}
      />
    );

    expect(screen.getByText('Test Metric')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText('+10')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const mockOnClick = jest.fn();
    render(
      <MetricsCard
        title="Test"
        value="100"
        onClick={mockOnClick}
      />
    );

    fireEvent.click(screen.getByRole('button'));
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });
});
```

#### Integration Testing
```typescript
// API integration testing
import { rest } from 'msw';
import { setupServer } from 'msw/node';

const server = setupServer(
  rest.get('/api/flights', (req, res, ctx) => {
    return res(ctx.json([
      { id: '1', flight: 'FL001', status: 'On Time' }
    ]));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test('loads and displays flights', async () => {
  render(<EnhancedFlightsTable />);
  
  await waitFor(() => {
    expect(screen.getByText('FL001')).toBeInTheDocument();
  });
});
```

### Backend Testing

#### API Endpoint Testing
```javascript
const request = require('supertest');
const app = require('../index');

describe('Flight API', () => {
  test('GET /api/flights returns flights', async () => {
    const response = await request(app)
      .get('/api/flights')
      .set('Authorization', `Bearer ${validToken}`);
    
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  test('GET /api/flights/:id returns specific flight', async () => {
    const response = await request(app)
      .get('/api/flights/flight123')
      .set('Authorization', `Bearer ${validToken}`);
    
    expect(response.status).toBe(200);
    expect(response.body.id).toBe('flight123');
  });
});
```

#### Database Testing
```javascript
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany();
  }
});
```

## Deployment Architecture

### Environment Configuration

#### Development Environment
```bash
# .env.local
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/ibs_v5_dev
JWT_SECRET=dev-secret-key
PORT=3001
CORS_ORIGIN=http://localhost:3000
```

#### Production Environment
```bash
# Production environment variables
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/ibs_v5_prod
JWT_SECRET=production-secure-jwt-secret-256-bit
PORT=3001
CORS_ORIGIN=https://yourdomain.com
REDIS_URL=redis://redis-server:6379
LOG_LEVEL=info
```

### Containerization

#### Docker Configuration
```dockerfile
# Dockerfile for backend
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3001

CMD ["npm", "start"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  backend:
    build: ./data-services
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongo:27017/ibs_v5
    depends_on:
      - mongo
      - redis

  frontend:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:3001

  mongo:
    image: mongo:6
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  mongo_data:
  redis_data:
```

### CI/CD Pipeline

#### GitHub Actions Workflow
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test
      - run: npm run lint

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to server
        run: |
          # Deployment commands
          ssh user@server "cd /app && git pull"
          ssh user@server "cd /app && npm ci --production"
          ssh user@server "cd /app && pm2 restart ibs-backend"
```

### Monitoring and Logging

#### Application Logging
```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}
```

#### Health Checks
```javascript
// Health check endpoint
app.get('/health', (req, res) => {
  const health = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  };

  const statusCode = health.database === 'connected' ? 200 : 503;
  res.status(statusCode).json(health);
});
```

---

*This technical architecture document provides comprehensive information about the IBS v5 system's technical design and implementation. For specific implementation details, refer to the actual source code files.*
