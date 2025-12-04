# IBS v5 - Integrated Business System

## Table of Contents
1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [Technology Stack](#technology-stack)
4. [Project Structure](#project-structure)
5. [Getting Started](#getting-started)
6. [API Documentation](#api-documentation)
7. [Component Documentation](#component-documentation)
8. [Database Schema](#database-schema)
9. [Authentication & Security](#authentication--security)
10. [Development Guidelines](#development-guidelines)
11. [Deployment](#deployment)
12. [Troubleshooting](#troubleshooting)
13. [Multi-Screen Docs](#multi-screen-docs)
14. [System Review Guide](#system-review-guide)

## System Overview

IBS v5 is a modern, real-time airline operations management dashboard built with Next.js 15 and React 18. The system provides comprehensive monitoring and management capabilities for airline operations, including flight tracking, alert management, performance metrics, and operational analytics.

### Key Features
- **Real-time Flight Operations**: Live tracking of flight status, delays, and cancellations
- **Comprehensive Alert System**: Multi-level alert management for operational issues
- **Performance Analytics**: KPI dashboards with historical data visualization
- **Responsive Design**: Modern UI with dark/light theme support
- **Search & Filtering**: Advanced search capabilities across flights and alerts
- **Role-based Access**: Secure authentication and authorization system

### Business Value
- **Operational Efficiency**: Real-time visibility into airline operations
- **Risk Management**: Proactive alert system for operational issues
- **Performance Monitoring**: Data-driven insights for operational improvements
- **Cost Reduction**: Minimize delays and operational disruptions

## Architecture

The system follows a modern, scalable architecture pattern:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   Database      │
│   (Next.js)     │◄──►│   (Express.js)  │◄──►│   (MongoDB)     │
│                 │    │                 │    │                 │
│ • React 18      │    │ • REST API      │    │ • Document Store│
│ • TypeScript    │    │ • JWT Auth      │    │ • Real-time     │
│ • Tailwind CSS  │    │ • CORS Enabled  │    │ • Scalable      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Architecture Principles
- **Separation of Concerns**: Clear separation between frontend, backend, and data layers
- **API-First Design**: RESTful API endpoints for all data operations
- **Real-time Updates**: Live data synchronization across components
- **Responsive Design**: Mobile-first approach with progressive enhancement
- **Security First**: JWT-based authentication with secure token management

## Technology Stack

### Frontend
- **Framework**: Next.js 15 (React 18)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 3.4 + CSS Variables
- **UI Components**: Radix UI + Custom Components
- **State Management**: React Hooks + Context
- **Charts**: Recharts
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT + bcrypt
- **CORS**: Enabled for cross-origin requests

### Development Tools
- **Package Manager**: npm/pnpm
- **Linting**: ESLint
- **Type Checking**: TypeScript
- **Build Tool**: Next.js built-in bundler
- **CSS Processing**: PostCSS + Autoprefixer

## Project Structure

```
ibs_v5/
├── app/                          # Next.js 15 App Router
│   ├── dashboard/               # Main dashboard page
│   ├── login/                   # Authentication page
│   ├── globals.css              # Global styles
│   ├── layout.tsx               # Root layout component
│   └── page.tsx                 # Home page (redirects to login)
├── components/                   # Reusable UI components
│   ├── ui/                      # Base UI components (Radix-based)
│   ├── enhanced-*.tsx           # Enhanced feature components
│   ├── metrics-card.tsx         # Metrics display component
│   ├── operations-chart.tsx     # Performance charts
│   └── theme-provider.tsx       # Theme management
├── data-services/                # Backend API server
│   ├── index.js                 # Express server + API endpoints
│   ├── models.js                # MongoDB schemas
│   └── seed.js                  # Database seeding
├── data/                         # Static data files
│   ├── alerts.json              # Sample alert data
│   ├── flights.json             # Sample flight data
│   └── metrics.json             # Sample metrics data
├── hooks/                        # Custom React hooks
├── lib/                          # Utility libraries
├── public/                       # Static assets
├── styles/                       # Additional stylesheets
└── services/                     # Frontend service layer
```

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or pnpm
- MongoDB instance (local or Atlas)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ibs_v5
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Install backend dependencies**
   ```bash
   cd data-services
   npm install
   ```

4. **Environment Setup**
   Create `.env` file in `data-services/`:
   ```env
   MONGODB_URI=mongodb://localhost:27017/ibs_v5
   JWT_SECRET=your-secure-jwt-secret
   PORT=3001
   ```

5. **Database Setup**
   ```bash
   cd data-services
   npm run seed
   ```

6. **Start Development Servers**
   
   **Terminal 1 - Backend:**
   ```bash
   cd data-services
   npm start
   ```
   
   **Terminal 2 - Frontend:**
   ```bash
   npm run dev
   ```

7. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
   - Default credentials: Check seed.js for test users

### Development Commands

```bash
# Frontend
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Backend
cd data-services
npm start            # Start backend server
npm run seed         # Seed database with sample data
```

## API Documentation

### Authentication Endpoints

#### POST /api/login
Authenticate user and receive JWT token.

**Request:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "token": "jwt-token-string"
}
```

#### GET /api/verify
Verify JWT token validity.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "ok": true
}
```

### Flight Management

#### GET /api/flights
Retrieve all flights.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
[
  {
    "id": "string",
    "flight": "string",
    "airline": "string",
    "route": "string",
    "status": "On Time|Delayed|Boarding|Departed|Cancelled",
    "scheduled": "string",
    "actual": "string",
    "estimatedArrival": "string",
    "progress": "number",
    "priority": "high|medium|low",
    "aircraft": "string",
    "registration": "string",
    "fuel": "number",
    "passengers": "number",
    "capacity": "number",
    "gate": "string",
    "terminal": "string",
    "crew": {
      "captain": "string",
      "firstOfficer": "string"
    },
    "weather": "string",
    "lastUpdate": "date"
  }
]
```

#### GET /api/flights/search?q={query}
Search flights by flight number, airline, route, or aircraft.

#### GET /api/flights/status/{status}
Filter flights by status.

#### GET /api/flights/airport/{airport}
Get flights for specific airport (origin or destination).

### Alert Management

#### GET /api/alerts
Retrieve all alerts.

**Response:**
```json
[
  {
    "id": "string",
    "type": "weather|security|delay|accident|operational|fuel|crew",
    "severity": "critical|high|medium|low",
    "title": "string",
    "message": "string",
    "affectedAirports": ["string"],
    "affectedFlights": ["string"],
    "timestamp": "date",
    "status": "active|resolved|monitoring",
    "source": "string",
    "details": "object"
  }
]
```

#### GET /api/alerts/active
Get only active alerts.

#### GET /api/alerts/type/{type}
Filter alerts by type.

#### GET /api/alerts/severity/{severity}
Filter alerts by severity level.

### Performance Metrics

#### GET /api/metrics
Retrieve KPI metrics.

**Response:**
```json
{
  "flightsToday": {
    "value": "number",
    "change": "number",
    "percentage": "number",
    "isPositive": "boolean",
    "unit": "string",
    "lastUpdated": "date"
  },
  "delays": { ... },
  "onTimePerformance": { ... },
  "cancellations": { ... }
}
```

#### GET /api/historical-metrics
Get historical performance data.

## Component Documentation

### Core Components

#### DashboardPage (`app/dashboard/page.tsx`)
Main dashboard component with tabbed navigation and real-time data display.

**Features:**
- Tabbed navigation (Dashboard, Flights, Weather, Alerts, Support, Settings)
- Real-time metrics display
- Global search functionality
- Theme switching
- Responsive sidebar navigation

**State Management:**
- Active tab selection
- Search query and results
- Metrics data
- Flight status filters

#### EnhancedFlightsTable (`components/enhanced-flights-table.tsx`)
Advanced flight management table with filtering, search, and real-time updates.

**Features:**
- Real-time flight data
- Status-based filtering
- Search functionality
- Flight details modal
- Alert integration
- Responsive design

**Props:**
```typescript
interface EnhancedFlightsTableProps {
  statusFilter?: Flight["status"] | "all" | null
}
```

#### EnhancedAlertsPanel (`components/enhanced-alerts-panel.tsx`)
Comprehensive alert management system with categorization and filtering.

**Features:**
- Multi-tab organization (All, Weather, Security, Delay, etc.)
- Severity-based filtering
- Alert dismissal
- Real-time updates
- Affected flights/airports display

#### MetricsCard (`components/metrics-card.tsx`)
Reusable metric display component with change indicators and tooltips.

**Features:**
- Value display with units
- Change indicators (positive/negative)
- Percentage calculations
- Interactive tooltips
- Click handlers for navigation

**Props:**
```typescript
interface MetricsCardProps {
  title: React.ReactNode
  value: string
  change?: {
    value: string
    percentage: string
    isPositive: boolean
  }
  onClick?: () => void
}
```

### UI Components

The system uses a comprehensive set of UI components built on Radix UI primitives:

- **Form Components**: Input, Button, Select, Checkbox, etc.
- **Layout Components**: Card, Dialog, Sheet, Accordion, etc.
- **Navigation**: Tabs, Breadcrumb, Navigation Menu, etc.
- **Feedback**: Toast, Alert, Progress, Skeleton, etc.
- **Data Display**: Table, Badge, Avatar, etc.

## Database Schema

### Collections

#### Alerts
```javascript
{
  id: String (unique),
  type: String (weather|security|delay|accident|operational|fuel|crew),
  severity: String (critical|high|medium|low),
  title: String,
  message: String,
  affectedAirports: [String],
  affectedFlights: [String],
  timestamp: Date,
  status: String (active|resolved|monitoring),
  source: String,
  details: Mixed
}
```

#### Flights
```javascript
{
  id: String (unique),
  flight: String,
  airline: String,
  route: String,
  origin: String,
  destination: String,
  status: String (On Time|Delayed|Boarding|Departed|Cancelled),
  scheduled: String,
  actual: String,
  estimatedArrival: String,
  progress: Number,
  priority: String (high|medium|low),
  aircraft: String,
  registration: String,
  passengers: Number,
  capacity: Number,
  gate: String,
  terminal: String,
  crew: {
    captain: String,
    firstOfficer: String
  },
  weather: String,
  fuel: Number,
  lastUpdate: Date
}
```

#### Metrics
```javascript
{
  kpi_name: String (unique),
  value: Number,
  change: Number,
  percentage: Number,
  isPositive: Boolean,
  unit: String,
  lastUpdated: Date
}
```

#### Users
```javascript
{
  userId: String (unique),
  username: String (unique),
  passwordHash: String,
  email: String,
  createdAt: Date
}
```

### Indexes
- Performance-optimized indexes on frequently queried fields
- Compound indexes for complex queries
- Text search indexes for search functionality

## Authentication & Security

### JWT Implementation
- **Token Expiry**: 2 hours
- **Secure Storage**: localStorage (consider httpOnly cookies for production)
- **Token Verification**: Automatic verification on protected routes

### Password Security
- **Hashing**: bcrypt with salt rounds
- **Validation**: Server-side password validation
- **Storage**: Hashed passwords only

### API Security
- **CORS**: Configured for development (customize for production)
- **Rate Limiting**: Consider implementing for production
- **Input Validation**: Server-side validation for all inputs

### Security Best Practices
- Environment variables for sensitive data
- HTTPS enforcement in production
- Regular security audits
- Input sanitization
- SQL injection prevention (MongoDB ODM)

## Development Guidelines

### Code Style
- **TypeScript**: Strict mode enabled
- **ESLint**: Consistent code formatting
- **Component Structure**: Functional components with hooks
- **Naming**: PascalCase for components, camelCase for functions

### State Management
- **Local State**: useState for component-specific state
- **Shared State**: Context API for theme and global state
- **Server State**: React Query or SWR for API data (future enhancement)

### Performance Optimization
- **Code Splitting**: Next.js automatic code splitting
- **Image Optimization**: Next.js Image component
- **Bundle Analysis**: Regular bundle size monitoring
- **Lazy Loading**: Component lazy loading where appropriate

### Testing Strategy
- **Unit Tests**: Component testing with Jest/React Testing Library
- **Integration Tests**: API endpoint testing
- **E2E Tests**: Playwright or Cypress for critical user flows
- **Performance Tests**: Lighthouse CI for performance monitoring

## Deployment

### Frontend Deployment
```bash
# Build the application
npm run build

# Start production server
npm start

# Or deploy to Vercel/Netlify
npm run build
# Deploy dist/ folder
```

### Backend Deployment
```bash
# Set production environment variables
NODE_ENV=production
MONGODB_URI=your-production-mongodb-uri
JWT_SECRET=your-production-jwt-secret

# Start production server
npm start
```

### Environment Configuration
- **Development**: `.env.local`
- **Production**: Environment variables in deployment platform
- **Staging**: Separate environment configuration

### Database Deployment
- **MongoDB Atlas**: Cloud-hosted solution
- **Local MongoDB**: Development environment
- **Backup Strategy**: Regular automated backups
- **Monitoring**: Database performance monitoring

## Troubleshooting

### Common Issues

#### Frontend Issues
1. **Build Errors**
   - Clear `.next` folder: `rm -rf .next`
   - Reinstall dependencies: `rm -rf node_modules && npm install`

2. **TypeScript Errors**
   - Check `tsconfig.json` configuration
   - Verify type definitions are installed
   - Run `npm run type-check`

3. **Styling Issues**
   - Verify Tailwind CSS configuration
   - Check CSS variable definitions
   - Clear browser cache

#### Backend Issues
1. **Database Connection**
   - Verify MongoDB URI
   - Check network connectivity
   - Verify database credentials

2. **API Errors**
   - Check server logs
   - Verify JWT token validity
   - Check CORS configuration

3. **Performance Issues**
   - Monitor database query performance
   - Check API response times
   - Verify indexing strategy

### Debug Mode
Enable debug logging in development:
```bash
DEBUG=* npm run dev
```

### Logs
- **Frontend**: Browser console and Next.js logs
- **Backend**: Console output and application logs
- **Database**: MongoDB query logs

### Support Resources
- **Documentation**: This README and component docs
- **Issues**: GitHub issues repository
- **Community**: React/Next.js community forums
- **Tools**: Browser DevTools, Postman for API testing

---

## Multi-Screen Docs

- Feature Overview: `docs/MULTI_SCREEN_FEATURE.md`
- Behavior Guide: `docs/MULTI_SCREEN_BEHAVIOR.md`
- Bug Fixes: `docs/MULTI_SCREEN_BUG_FIXES.md`
- Troubleshooting: `docs/MULTI_SCREEN_TROUBLESHOOTING.md`
- History/Changelog: `docs/MULTI_SCREEN_HISTORY.md`

Key APIs:
```ts
// Hook call with layout options
await popOutDetailedView('alerts', undefined, {
  layout: 'grid',     // 'grid' | 'rows' | 'columns' | 'custom'
  totalSlots: 4,
  // slotIndex: 0,   // optional: auto-cycles if omitted
  paddingPx: 16
  // explicitRect: { left, top, width, height } // optional override
})
```

---

## System Review Guide

See `docs/SYSTEM_REVIEW_GUIDE.md` for a comprehensive technical review guide (architecture, extension, backend APIs, testing, risks, and reviewer checklist).

---

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

For questions or support, please open an issue in the GitHub repository or contact the development team.

---

*Last updated: December 2024*
*Version: 5.0.0*
