# Quick Reference Guide

## 🚀 Quick Start

```bash
# Clone and setup
git clone <repo-url>
cd ibs_v5
npm install
cd data-services && npm install

# Start development
npm run dev          # Frontend (port 3000)
cd data-services && npm start  # Backend (port 3001)
```

## 📁 Project Structure

```
ibs_v5/
├── app/                    # Next.js pages
├── components/            # React components
├── data-services/         # Backend API
├── data/                  # Sample data
├── lib/                   # Utilities
└── public/                # Static assets
```

## 🔑 Key Commands

```bash
# Frontend
npm run dev          # Development server
npm run build        # Production build
npm run start        # Production server
npm run lint         # Code linting

# Backend
cd data-services
npm start            # Start API server
npm run seed         # Seed database
```

## 🌐 API Endpoints

### Authentication
- `POST /api/login` - User login
- `GET /api/verify` - Verify JWT token

### Flights
- `GET /api/flights` - All flights
- `GET /api/flights/:id` - Specific flight
- `GET /api/flights/search?q=query` - Search flights
- `GET /api/flights/status/:status` - Filter by status

### Alerts
- `GET /api/alerts` - All alerts
- `GET /api/alerts/active` - Active alerts
- `GET /api/alerts/type/:type` - Filter by type

### Metrics
- `GET /api/metrics` - KPI metrics
- `GET /api/historical-metrics` - Historical data

## 🗄️ Database Collections

### Flights
```javascript
{
  id: String,
  flight: String,
  airline: String,
  route: String,
  status: "On Time" | "Delayed" | "Boarding" | "Departed" | "Cancelled",
  scheduled: String,
  actual: String,
  passengers: Number,
  capacity: Number
}
```

### Alerts
```javascript
{
  id: String,
  type: "weather" | "security" | "delay" | "accident" | "operational" | "fuel" | "crew",
  severity: "critical" | "high" | "medium" | "low",
  title: String,
  message: String,
  status: "active" | "resolved" | "monitoring"
}
```

## 🎨 Component Props

### MetricsCard
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

### EnhancedFlightsTable
```typescript
interface EnhancedFlightsTableProps {
  statusFilter?: Flight["status"] | "all" | null;
}
```

### EnhancedAlertsPanel
```typescript
// No props required - self-contained component
```

## 🔧 Environment Variables

### Backend (.env)
```env
MONGODB_URI=mongodb://localhost:27017/ibs_v5
JWT_SECRET=your-secret-key
PORT=3001
NODE_ENV=development
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## 🎯 Common Patterns

### Data Fetching
```typescript
useEffect(() => {
  const loadData = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/endpoint", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setData(data);
    } catch (error) {
      console.error("Failed to load data:", error);
    }
  };
  loadData();
}, []);
```

### Error Handling
```typescript
try {
  const result = await apiCall();
  setData(result);
} catch (error) {
  setError(error.message);
} finally {
  setLoading(false);
}
```

### Loading States
```typescript
{loading ? (
  <Skeleton className="h-20 w-full" />
) : (
  <ActualContent />
)}
```

## 🎨 Styling Classes

### Common Layout
```css
"flex items-center justify-between"     /* Horizontal layout */
"grid gap-4 md:grid-cols-2"            /* Responsive grid */
"p-4 bg-background border rounded-lg"   /* Card styling */
"text-foreground text-sm text-muted"    /* Typography */
```

### Status Colors
```css
"bg-green-500/20 text-green-400"       /* Success/On Time */
"bg-red-500/20 text-red-400"           /* Error/Delayed */
"bg-yellow-500/20 text-yellow-400"     /* Warning/Boarding */
"bg-blue-500/20 text-blue-400"         /* Info/Departed */
```

## 🔐 Authentication Flow

1. **Login**: `POST /api/login` with username/password
2. **Token Storage**: JWT stored in localStorage
3. **API Calls**: Include `Authorization: Bearer <token>` header
4. **Token Verification**: Automatic on protected routes
5. **Logout**: Remove token from localStorage

## 📱 Responsive Breakpoints

```css
/* Tailwind CSS breakpoints */
sm: 640px    /* Small devices */
md: 768px    /* Medium devices */
lg: 1024px   /* Large devices */
xl: 1280px   /* Extra large devices */
2xl: 1536px  /* 2X large devices */
```

## 🚨 Common Issues

### Frontend
- **Build Errors**: Clear `.next` folder and reinstall dependencies
- **Styling Issues**: Check Tailwind config and CSS variables
- **TypeScript Errors**: Verify `tsconfig.json` and type definitions

### Backend
- **Database Connection**: Check MongoDB URI and connection string
- **Port Conflicts**: Verify no other service uses port 3001
- **CORS Issues**: Check CORS configuration in Express server

### Database
- **Connection Issues**: Verify MongoDB service is running
- **Data Loading**: Check if database is seeded with sample data
- **Index Issues**: Verify database indexes are created

## 📊 Performance Tips

1. **Use React.memo** for expensive components
2. **Implement lazy loading** for large components
3. **Optimize images** with Next.js Image component
4. **Use proper indexes** in MongoDB
5. **Implement caching** for frequently accessed data

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Run linting
npm run lint

# Type checking
npm run type-check
```

## 📦 Dependencies

### Key Frontend Packages
- Next.js 15, React 18, TypeScript 5
- Tailwind CSS 3.4, Radix UI
- Recharts, Lucide React

### Key Backend Packages
- Express.js, Mongoose
- JWT, bcrypt, CORS

## 🔄 Development Workflow

1. **Feature Development**: Create feature branch
2. **Local Testing**: Test frontend and backend locally
3. **Code Review**: Submit pull request
4. **Testing**: Run tests and linting
5. **Deployment**: Deploy to staging/production

## 📞 Support

- **Documentation**: Check README.md and docs/ folder
- **Issues**: Create GitHub issue for bugs
- **Questions**: Check component documentation
- **Architecture**: Review technical architecture docs

---

*This quick reference guide provides essential information for developers working with the IBS v5 system. For detailed information, refer to the full documentation.*
