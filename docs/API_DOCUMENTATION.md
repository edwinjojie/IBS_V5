# API Documentation

## Table of Contents
1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Base URL](#base-url)
4. [Error Handling](#error-handling)
5. [Endpoints](#endpoints)
6. [Data Models](#data-models)
7. [Examples](#examples)

## Overview

The IBS v5 API is a RESTful service built with Express.js that provides access to airline operations data. All endpoints require authentication via JWT tokens, except for the login endpoint.

### Features
- **RESTful Design**: Standard HTTP methods and status codes
- **JWT Authentication**: Secure token-based authentication
- **MongoDB Integration**: Document-based data storage
- **Real-time Data**: Live flight and alert information
- **Search & Filtering**: Advanced query capabilities

## Authentication

### JWT Token
All protected endpoints require a valid JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Token Format
- **Algorithm**: HS256
- **Expiration**: 2 hours
- **Payload**: Contains userId and username

### Getting a Token
1. Send POST request to `/api/login` with credentials
2. Receive JWT token in response
3. Include token in subsequent requests

## Base URL

**Development**: `http://localhost:3001`  
**Production**: `https://yourdomain.com`

## Error Handling

### Standard Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": "Additional error information"
  }
}
```

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

### Common Error Codes
- `VALIDATION_ERROR` - Input validation failed
- `AUTHENTICATION_ERROR` - Invalid or expired token
- `NOT_FOUND` - Resource not found
- `DUPLICATE_KEY` - Resource already exists
- `DATABASE_ERROR` - Database operation failed

## Endpoints

### Authentication

#### POST /api/login
Authenticate user and receive JWT token.

**Request Body**:
```json
{
  "username": "string",
  "password": "string"
}
```

**Response** (200):
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response** (401):
```json
{
  "success": false,
  "error": {
    "code": "AUTHENTICATION_ERROR",
    "message": "Invalid credentials"
  }
}
```

**Example**:
```bash
curl -X POST http://localhost:3001/api/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "password123"}'
```

#### GET /api/verify
Verify JWT token validity.

**Headers**:
```
Authorization: Bearer <jwt-token>
```

**Response** (200):
```json
{
  "success": true,
  "message": "Token is valid"
}
```

**Response** (401):
```json
{
  "success": false,
  "error": {
    "code": "AUTHENTICATION_ERROR",
    "message": "Invalid or expired token"
  }
}
```

**Example**:
```bash
curl -X GET http://localhost:3001/api/verify \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Flight Management

#### GET /api/flights
Retrieve all flights with optional filtering.

**Headers**:
```
Authorization: Bearer <jwt-token>
```

**Query Parameters**:
- `limit` (optional): Number of flights to return (default: all)
- `offset` (optional): Number of flights to skip
- `sort` (optional): Sort field (e.g., "scheduled", "-lastUpdate")
- `status` (optional): Filter by flight status

**Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": "flight_001",
      "flight": "FL001",
      "airline": "Airline A",
      "route": "JFK-LAX",
      "origin": "JFK",
      "destination": "LAX",
      "status": "On Time",
      "scheduled": "2024-12-01T10:00:00Z",
      "actual": "2024-12-01T10:05:00Z",
      "estimatedArrival": "2024-12-01T13:00:00Z",
      "progress": 45,
      "priority": "high",
      "aircraft": "Boeing 737",
      "registration": "N12345",
      "passengers": 150,
      "capacity": 180,
      "gate": "A12",
      "terminal": "Terminal 1",
      "crew": {
        "captain": "John Smith",
        "firstOfficer": "Jane Doe"
      },
      "weather": "Clear skies",
      "fuel": 85,
      "lastUpdate": "2024-12-01T10:30:00Z"
    }
  ],
  "pagination": {
    "total": 150,
    "limit": 50,
    "offset": 0,
    "pages": 3
  }
}
```

**Example**:
```bash
curl -X GET "http://localhost:3001/api/flights?limit=10&status=Delayed" \
  -H "Authorization: Bearer <jwt-token>"
```

#### GET /api/flights/:id
Retrieve a specific flight by ID.

**Headers**:
```
Authorization: Bearer <jwt-token>
```

**Path Parameters**:
- `id`: Flight ID

**Response** (200):
```json
{
  "success": true,
  "data": {
    "id": "flight_001",
    "flight": "FL001",
    "airline": "Airline A",
    "route": "JFK-LAX",
    "status": "On Time",
    "scheduled": "2024-12-01T10:00:00Z",
    "actual": "2024-12-01T10:05:00Z",
    "passengers": 150,
    "capacity": 180
  }
}
```

**Response** (404):
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Flight not found"
  }
}
```

**Example**:
```bash
curl -X GET http://localhost:3001/api/flights/flight_001 \
  -H "Authorization: Bearer <jwt-token>"
```

#### GET /api/flights/status/:status
Filter flights by status.

**Headers**:
```
Authorization: Bearer <jwt-token>
```

**Path Parameters**:
- `status`: Flight status (On Time, Delayed, Boarding, Departed, Cancelled)

**Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": "flight_002",
      "flight": "FL002",
      "status": "Delayed",
      "route": "LAX-ORD"
    }
  ]
}
```

**Example**:
```bash
curl -X GET http://localhost:3001/api/flights/status/Delayed \
  -H "Authorization: Bearer <jwt-token>"
```

#### GET /api/flights/search
Search flights by various criteria.

**Headers**:
```
Authorization: Bearer <jwt-token>
```

**Query Parameters**:
- `q`: Search query string
- `type`: Search type (flight, airline, route, aircraft)

**Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": "flight_003",
      "flight": "FL003",
      "airline": "Airline B",
      "route": "ORD-DFW"
    }
  ]
}
```

**Example**:
```bash
curl -X GET "http://localhost:3001/api/flights/search?q=FL003" \
  -H "Authorization: Bearer <jwt-token>"
```

#### GET /api/flights/airport/:airport
Get flights for a specific airport.

**Headers**:
```
Authorization: Bearer <jwt-token>
```

**Path Parameters**:
- `airport`: Airport code (e.g., JFK, LAX)

**Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": "flight_004",
      "flight": "FL004",
      "route": "JFK-LHR",
      "status": "Boarding"
    }
  ]
}
```

**Example**:
```bash
curl -X GET http://localhost:3001/api/flights/airport/JFK \
  -H "Authorization: Bearer <jwt-token>"
```

### Alert Management

#### GET /api/alerts
Retrieve all alerts with optional filtering.

**Headers**:
```
Authorization: Bearer <jwt-token>
```

**Query Parameters**:
- `limit` (optional): Number of alerts to return
- `offset` (optional): Number of alerts to skip
- `type` (optional): Filter by alert type
- `severity` (optional): Filter by severity level
- `status` (optional): Filter by status

**Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": "alert_001",
      "type": "weather",
      "severity": "high",
      "title": "Severe Weather Warning",
      "message": "Thunderstorms expected in JFK area",
      "affectedAirports": ["JFK", "LGA"],
      "affectedFlights": ["FL001", "FL002"],
      "timestamp": "2024-12-01T10:00:00Z",
      "status": "active",
      "source": "Weather Service",
      "details": {
        "estimatedDuration": "2 hours",
        "windSpeed": "25 mph",
        "visibility": "1 mile"
      }
    }
  ]
}
```

**Example**:
```bash
curl -X GET "http://localhost:3001/api/alerts?severity=high&status=active" \
  -H "Authorization: Bearer <jwt-token>"
```

#### GET /api/alerts/active
Get only active alerts.

**Headers**:
```
Authorization: Bearer <jwt-token>
```

**Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": "alert_002",
      "type": "delay",
      "severity": "medium",
      "title": "ATC Delay",
      "status": "active"
    }
  ]
}
```

**Example**:
```bash
curl -X GET http://localhost:3001/api/alerts/active \
  -H "Authorization: Bearer <jwt-token>"
```

#### GET /api/alerts/type/:type
Filter alerts by type.

**Headers**:
```
Authorization: Bearer <jwt-token>
```

**Path Parameters**:
- `type`: Alert type (weather, security, delay, accident, operational, fuel, crew)

**Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": "alert_003",
      "type": "weather",
      "title": "Fog Advisory",
      "status": "monitoring"
    }
  ]
}
```

**Example**:
```bash
curl -X GET http://localhost:3001/api/alerts/type/weather \
  -H "Authorization: Bearer <jwt-token>"
```

#### GET /api/alerts/severity/:severity
Filter alerts by severity level.

**Headers**:
```
Authorization: Bearer <jwt-token>
```

**Path Parameters**:
- `severity`: Severity level (critical, high, medium, low)

**Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": "alert_004",
      "type": "security",
      "severity": "critical",
      "title": "Security Breach",
      "status": "active"
    }
  ]
}
```

**Example**:
```bash
curl -X GET http://localhost:3001/api/alerts/severity/critical \
  -H "Authorization: Bearer <jwt-token>"
```

#### GET /api/alerts/flight/:flightNumber
Get alerts affecting a specific flight.

**Headers**:
```
Authorization: Bearer <jwt-token>
```

**Path Parameters**:
- `flightNumber`: Flight number (e.g., FL001)

**Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": "alert_005",
      "type": "delay",
      "title": "Flight FL001 Delayed",
      "affectedFlights": ["FL001"]
    }
  ]
}
```

**Example**:
```bash
curl -X GET http://localhost:3001/api/alerts/flight/FL001 \
  -H "Authorization: Bearer <jwt-token>"
```

### Performance Metrics

#### GET /api/metrics
Retrieve current KPI metrics.

**Headers**:
```
Authorization: Bearer <jwt-token>
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "flightsToday": {
      "value": 156,
      "change": 12,
      "percentage": 8.3,
      "isPositive": true,
      "unit": "flights",
      "lastUpdated": "2024-12-01T10:00:00Z"
    },
    "delays": {
      "value": 23,
      "change": 5,
      "percentage": 27.8,
      "isPositive": false,
      "unit": "flights",
      "lastUpdated": "2024-12-01T10:00:00Z"
    },
    "onTimePerformance": {
      "value": 85.2,
      "change": 2.1,
      "percentage": 2.5,
      "isPositive": true,
      "unit": "%",
      "lastUpdated": "2024-12-01T10:00:00Z"
    },
    "cancellations": {
      "value": 3,
      "change": -1,
      "percentage": -25.0,
      "isPositive": true,
      "unit": "flights",
      "lastUpdated": "2024-12-01T10:00:00Z"
    }
  }
}
```

**Example**:
```bash
curl -X GET http://localhost:3001/api/metrics \
  -H "Authorization: Bearer <jwt-token>"
```

#### GET /api/historical-metrics
Get historical performance data.

**Headers**:
```
Authorization: Bearer <jwt-token>
```

**Query Parameters**:
- `period`: Time period (today, week, month, 6months, year)
- `startDate`: Start date (ISO format)
- `endDate`: End date (ISO format)

**Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "time": "2024-12-01",
      "onTime": 85.2,
      "flights": 156,
      "delays": 23
    },
    {
      "time": "2024-11-30",
      "onTime": 87.1,
      "flights": 148,
      "delays": 19
    }
  ]
}
```

**Example**:
```bash
curl -X GET "http://localhost:3001/api/historical-metrics?period=week" \
  -H "Authorization: Bearer <jwt-token>"
```

## Data Models

### Flight Object
```typescript
interface Flight {
  id: string;                    // Unique identifier
  flight: string;                // Flight number
  airline: string;               // Airline name
  route: string;                 // Route description
  origin: string;                // Origin airport code
  destination: string;           // Destination airport code
  status: FlightStatus;          // Current flight status
  scheduled: string;             // Scheduled departure time (ISO)
  actual?: string;               // Actual departure time (ISO)
  estimatedArrival?: string;     // Estimated arrival time (ISO)
  progress?: number;             // Flight progress (0-100)
  priority?: FlightPriority;     // Flight priority level
  aircraft?: string;             // Aircraft type
  registration?: string;         // Aircraft registration
  passengers?: number;           // Current passenger count
  capacity?: number;             // Aircraft capacity
  gate?: string;                 // Departure gate
  terminal?: string;             // Terminal number
  crew?: {                       // Flight crew information
    captain: string;
    firstOfficer: string;
  };
  weather?: string;              // Weather conditions
  fuel?: number;                 // Fuel level percentage
  lastUpdate: string;            // Last update timestamp (ISO)
}

type FlightStatus = "On Time" | "Delayed" | "Boarding" | "Departed" | "Cancelled";
type FlightPriority = "high" | "medium" | "low";
```

### Alert Object
```typescript
interface Alert {
  id: string;                    // Unique identifier
  type: AlertType;               // Alert category
  severity: AlertSeverity;       // Severity level
  title: string;                 // Alert title
  message: string;               // Alert description
  affectedAirports: string[];    // Affected airport codes
  affectedFlights: string[];     // Affected flight numbers
  timestamp: string;             // Alert timestamp (ISO)
  status: AlertStatus;           // Current status
  source: string;                // Alert source
  details?: any;                 // Type-specific details
}

type AlertType = "weather" | "security" | "delay" | "accident" | "operational" | "fuel" | "crew";
type AlertSeverity = "critical" | "high" | "medium" | "low";
type AlertStatus = "active" | "resolved" | "monitoring";
```

### Metric Object
```typescript
interface Metric {
  kpi_name: string;              // Metric name
  value: number;                 // Current value
  change?: number;               // Change from previous period
  percentage?: number;           // Percentage change
  isPositive?: boolean;          // Whether change is positive
  unit?: string;                 // Unit of measurement
  lastUpdated: string;           // Last update timestamp (ISO)
}
```

## Examples

### Complete Flight Search Workflow

```bash
# 1. Login to get token
TOKEN=$(curl -s -X POST http://localhost:3001/api/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "password123"}' | \
  jq -r '.token')

# 2. Search for delayed flights
curl -X GET "http://localhost:3001/api/flights/status/Delayed" \
  -H "Authorization: Bearer $TOKEN"

# 3. Get alerts for specific flight
curl -X GET "http://localhost:3001/api/alerts/flight/FL001" \
  -H "Authorization: Bearer $TOKEN"

# 4. Get current metrics
curl -X GET "http://localhost:3001/api/metrics" \
  -H "Authorization: Bearer $TOKEN"
```

### JavaScript/TypeScript Examples

```typescript
// API client class
class IBSApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async login(username: string, password: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    const data = await response.json();
    this.token = data.token;
  }

  async getFlights(status?: string): Promise<Flight[]> {
    if (!this.token) {
      throw new Error('Not authenticated');
    }

    const url = status 
      ? `${this.baseUrl}/api/flights/status/${status}`
      : `${this.baseUrl}/api/flights`;

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${this.token}` }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch flights');
    }

    const data = await response.json();
    return data.data;
  }

  async getAlerts(severity?: string): Promise<Alert[]> {
    if (!this.token) {
      throw new Error('Not authenticated');
    }

    const url = severity 
      ? `${this.baseUrl}/api/alerts/severity/${severity}`
      : `${this.baseUrl}/api/alerts`;

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${this.token}` }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch alerts');
    }

    const data = await response.json();
    return data.data;
  }
}

// Usage
const client = new IBSApiClient('http://localhost:3001');

try {
  await client.login('admin', 'password123');
  
  const delayedFlights = await client.getFlights('Delayed');
  const criticalAlerts = await client.getAlerts('critical');
  
  console.log('Delayed flights:', delayedFlights);
  console.log('Critical alerts:', criticalAlerts);
} catch (error) {
  console.error('API error:', error);
}
```

### Python Examples

```python
import requests
import json

class IBSApiClient:
    def __init__(self, base_url):
        self.base_url = base_url
        self.token = None

    def login(self, username, password):
        response = requests.post(
            f"{self.base_url}/api/login",
            json={"username": username, "password": password}
        )
        response.raise_for_status()
        
        data = response.json()
        self.token = data["token"]

    def get_flights(self, status=None):
        if not self.token:
            raise Exception("Not authenticated")

        headers = {"Authorization": f"Bearer {self.token}"}
        
        if status:
            url = f"{self.base_url}/api/flights/status/{status}"
        else:
            url = f"{self.base_url}/api/flights"

        response = requests.get(url, headers=headers)
        response.raise_for_status()
        
        data = response.json()
        return data["data"]

    def get_alerts(self, severity=None):
        if not self.token:
            raise Exception("Not authenticated")

        headers = {"Authorization": f"Bearer {self.token}"}
        
        if severity:
            url = f"{self.base_url}/api/alerts/severity/{severity}"
        else:
            url = f"{self.base_url}/api/alerts"

        response = requests.get(url, headers=headers)
        response.raise_for_status()
        
        data = response.json()
        return data["data"]

# Usage
client = IBSApiClient("http://localhost:3001")

try:
    client.login("admin", "password123")
    
    delayed_flights = client.get_flights("Delayed")
    critical_alerts = client.get_alerts("critical")
    
    print("Delayed flights:", delayed_flights)
    print("Critical alerts:", critical_alerts)
except Exception as error:
    print(f"API error: {error}")
```

---

*This API documentation provides comprehensive information about all endpoints, data models, and usage examples. For additional support, refer to the main README and component documentation.*
