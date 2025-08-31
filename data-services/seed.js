const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { Alerts, Flights, Metrics, HistoricalMetrics, Users, Sessions, Screens, WidgetPreferences } = require('./models');
require('dotenv').config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB Atlas');

    // Clear existing data
    await Promise.all([
      Alerts.deleteMany({}),
      Flights.deleteMany({}),
      Metrics.deleteMany({}),
      HistoricalMetrics.deleteMany({}),
      Users.deleteMany({}),
      Sessions.deleteMany({}),
      Screens.deleteMany({}),
      WidgetPreferences.deleteMany({})
    ]);

    console.log('🧹 Cleared existing data');

    // Seed Alerts with fresh data
    await Alerts.insertMany([
      {
        id: "alert_2025_001",
        type: "weather",
        severity: "critical",
        title: "Hurricane Warning - Category 3",
        message: "Hurricane Maria approaching Miami International Airport. All flights suspended until further notice. Expected duration: 24-36 hours.",
        affectedAirports: ["MIA", "FLL", "PBI"],
        affectedFlights: ["AA7890", "DL4567", "UA8901", "WN2345"],
        timestamp: new Date("2025-01-15T08:00:00Z"),
        status: "active",
        source: "National Hurricane Center",
        details: { 
          estimatedDuration: "24-36 hours", 
          windSpeed: "120 mph",
          recommendations: "Evacuate aircraft, secure ground equipment" 
        }
      },
      {
        id: "alert_2025_002",
        type: "security",
        severity: "high",
        title: "Security Breach - Terminal 3",
        message: "Unauthorized access detected at LAX Terminal 3. Security protocols activated. All passengers must re-enter through security.",
        affectedAirports: ["LAX"],
        affectedFlights: ["AA1234", "DL5678", "UA9012"],
        timestamp: new Date("2025-01-15T10:30:00Z"),
        status: "active",
        source: "TSA",
        details: { 
          estimatedDelay: "2-3 hours",
          affectedTerminals: ["Terminal 3"],
          securityLevel: "Orange"
        }
      },
      {
        id: "alert_2025_003",
        type: "operational",
        severity: "medium",
        title: "Runway Maintenance - JFK",
        message: "Runway 13L/31R closed for emergency repairs. Reduced capacity expected. Delays of 45-90 minutes.",
        affectedAirports: ["JFK"],
        affectedFlights: ["AA2345", "DL6789", "UA0123"],
        timestamp: new Date("2025-01-15T12:15:00Z"),
        status: "active",
        source: "Port Authority NY/NJ",
        details: { 
          estimatedDuration: "6-8 hours",
          affectedRunways: ["13L/31R"],
          alternativeRunways: ["04L/22R", "04R/22L"]
        }
      },
      {
        id: "alert_2025_004",
        type: "fuel",
        severity: "medium",
        title: "Fuel Shortage - ORD",
        message: "Limited fuel availability at O'Hare International Airport. Some flights may be delayed or require fuel stops.",
        affectedAirports: ["ORD"],
        affectedFlights: ["AA3456", "DL7890", "UA1234"],
        timestamp: new Date("2025-01-15T14:45:00Z"),
        status: "monitoring",
        source: "Chicago Department of Aviation",
        details: { 
          fuelType: "Jet A-1",
          estimatedResolution: "4-6 hours",
          affectedAirlines: ["AA", "DL", "UA"]
        }
      },
      {
        id: "alert_2025_005",
        type: "crew",
        severity: "low",
        title: "Crew Scheduling Issue - ATL",
        message: "Multiple crew members unavailable due to weather delays. Minor delays expected on regional flights.",
        affectedAirports: ["ATL"],
        affectedFlights: ["DL3456", "WN7890"],
        timestamp: new Date("2025-01-15T16:20:00Z"),
        status: "resolved",
        source: "Delta Air Lines",
        details: { 
          affectedRoutes: ["ATL-MIA", "ATL-ORD"],
          estimatedDelay: "15-30 minutes",
          resolution: "Backup crew assigned"
        }
      }
    ]);

    // Seed Flights with fresh data
    await Flights.insertMany([
      {
        id: "flight_2025_001",
        flight: "AA7890",
        airline: "American Airlines",
        route: "MIA → JFK",
        origin: "MIA",
        destination: "JFK",
        status: "Cancelled",
        scheduled: "2025-01-15T14:30:00Z",
        actual: null,
        estimatedArrival: null,
        progress: 0,
        priority: "high",
        aircraft: "Boeing 787-9 Dreamliner",
        registration: "N789AA",
        passengers: 0,
        capacity: 285,
        gate: "D12",
        terminal: "Terminal D",
        crew: { captain: "Captain Sarah Martinez", firstOfficer: "First Officer James Wilson" },
        weather: "Hurricane Conditions",
        fuel: 0,
        lastUpdate: new Date("2025-01-15T08:00:00Z")
      },
      {
        id: "flight_2025_002",
        flight: "DL4567",
        airline: "Delta Air Lines",
        route: "ATL → LAX",
        origin: "ATL",
        destination: "LAX",
        status: "Delayed",
        scheduled: "2025-01-15T16:45:00Z",
        actual: "2025-01-15T18:15:00Z",
        estimatedArrival: "2025-01-15T19:45:00Z",
        progress: 45,
        priority: "medium",
        aircraft: "Airbus A350-900",
        registration: "N456DL",
        passengers: 298,
        capacity: 306,
        gate: "B15",
        terminal: "Terminal B",
        crew: { captain: "Captain Michael Chen", firstOfficer: "First Officer Emily Rodriguez" },
        weather: "Clear",
        fuel: 85,
        lastUpdate: new Date("2025-01-15T18:15:00Z")
      },
      {
        id: "flight_2025_003",
        flight: "UA8901",
        airline: "United Airlines",
        route: "SFO → ORD",
        origin: "SFO",
        destination: "ORD",
        status: "On Time",
        scheduled: "2025-01-15T09:00:00Z",
        actual: "2025-01-15T09:02:00Z",
        estimatedArrival: "2025-01-15T15:30:00Z",
        progress: 75,
        priority: "low",
        aircraft: "Boeing 737 MAX 9",
        registration: "N890UA",
        passengers: 178,
        capacity: 189,
        gate: "G7",
        terminal: "Terminal G",
        crew: { captain: "Captain David Thompson", firstOfficer: "First Officer Lisa Park" },
        weather: "Clear",
        fuel: 78,
        lastUpdate: new Date("2025-01-15T09:02:00Z")
      },
      {
        id: "flight_2025_004",
        flight: "WN2345",
        airline: "Southwest Airlines",
        route: "DEN → BWI",
        origin: "DEN",
        destination: "BWI",
        status: "Boarding",
        scheduled: "2025-01-15T17:30:00Z",
        actual: null,
        estimatedArrival: "2025-01-15T21:45:00Z",
        progress: 0,
        priority: "medium",
        aircraft: "Boeing 737-800",
        registration: "N234WN",
        passengers: 143,
        capacity: 175,
        gate: "C8",
        terminal: "Terminal C",
        crew: { captain: "Captain Robert Johnson", firstOfficer: "First Officer Maria Garcia" },
        weather: "Light Snow",
        fuel: 92,
        lastUpdate: new Date("2025-01-15T17:00:00Z")
      },
      {
        id: "flight_2025_005",
        flight: "BA1234",
        airline: "British Airways",
        route: "LHR → JFK",
        origin: "LHR",
        destination: "JFK",
        status: "Delayed",
        scheduled: "2025-01-15T13:00:00Z",
        actual: "2025-01-15T15:30:00Z",
        estimatedArrival: "2025-01-15T18:45:00Z",
        progress: 60,
        priority: "high",
        aircraft: "Airbus A380-800",
        registration: "G-BAKE",
        passengers: 485,
        capacity: 469,
        gate: "A8",
        terminal: "Terminal A",
        crew: { captain: "Captain William Smith", firstOfficer: "First Officer Emma Davis" },
        weather: "Clear",
        fuel: 88,
        lastUpdate: new Date("2025-01-15T15:30:00Z")
      }
    ]);

    // Seed Metrics with fresh comprehensive data
    await Metrics.insertMany([
      {
        kpi_name: "totalFlights",
        value: 2847,
        change: 156,
        percentage: 5.8,
        isPositive: true,
        unit: "flights",
        target: 3000,
        lastUpdated: new Date("2025-01-15T18:30:00Z")
      },
      {
        kpi_name: "onTimePerformance",
        value: 87.3,
        change: -2.1,
        percentage: -2.3,
        isPositive: false,
        unit: "%",
        target: 90.0,
        lastUpdated: new Date("2025-01-15T18:30:00Z")
      },
      {
        kpi_name: "delayedFlights",
        value: 342,
        change: 45,
        percentage: 15.1,
        isPositive: false,
        unit: "flights",
        target: 300,
        lastUpdated: new Date("2025-01-15T18:30:00Z")
      },
      {
        kpi_name: "cancelledFlights",
        value: 23,
        change: -8,
        percentage: -25.8,
        isPositive: true,
        unit: "flights",
        target: 25,
        lastUpdated: new Date("2025-01-15T18:30:00Z")
      },
      {
        kpi_name: "passengerSatisfaction",
        value: 4.6,
        change: 0.2,
        percentage: 4.5,
        isPositive: true,
        unit: "rating",
        target: 4.8,
        lastUpdated: new Date("2025-01-15T18:30:00Z")
      },
      {
        kpi_name: "fuelEfficiency",
        value: 89.2,
        change: 1.8,
        percentage: 2.1,
        isPositive: true,
        unit: "%",
        target: 92.0,
        lastUpdated: new Date("2025-01-15T18:30:00Z")
      },
      {
        kpi_name: "baggageHandling",
        value: 96.8,
        change: 0.5,
        percentage: 0.5,
        isPositive: true,
        unit: "%",
        target: 97.0,
        lastUpdated: new Date("2025-01-15T18:30:00Z")
      },
      {
        kpi_name: "crewUtilization",
        value: 78.5,
        change: -1.2,
        percentage: -1.5,
        isPositive: false,
        unit: "%",
        target: 80.0,
        lastUpdated: new Date("2025-01-15T18:30:00Z")
      },
      {
        kpi_name: "maintenanceReliability",
        value: 99.1,
        change: 0.3,
        percentage: 0.3,
        isPositive: true,
        unit: "%",
        target: 99.5,
        lastUpdated: new Date("2025-01-15T18:30:00Z")
      },
      {
        kpi_name: "securityEfficiency",
        value: 94.7,
        change: 2.1,
        percentage: 2.3,
        isPositive: true,
        unit: "%",
        target: 95.0,
        lastUpdated: new Date("2025-01-15T18:30:00Z")
      }
    ]);

    // Seed HistoricalMetrics with comprehensive time series data
    await HistoricalMetrics.insertMany([
      { time: "2025-01-15T06:00:00Z", value: 89.2, target: 90.0 },
      { time: "2025-01-15T08:00:00Z", value: 87.8, target: 90.0 },
      { time: "2025-01-15T10:00:00Z", value: 86.5, target: 90.0 },
      { time: "2025-01-15T12:00:00Z", value: 84.2, target: 90.0 },
      { time: "2025-01-15T14:00:00Z", value: 85.7, target: 90.0 },
      { time: "2025-01-15T16:00:00Z", value: 86.9, target: 90.0 },
      { time: "2025-01-15T18:00:00Z", value: 87.3, target: 90.0 }
    ]);

    // Seed Users with fresh credentials
    const passwordHash = await bcrypt.hash('ibs2025!', 12);
    await Users.insertMany([
      {
        userId: "user_2025_001",
        username: "admin2025",
        passwordHash,
        email: "admin@ibs2025.com",
        createdAt: new Date()
      },
      {
        userId: "user_2025_002",
        username: "operator2025",
        passwordHash: await bcrypt.hash('operator2025!', 12),
        email: "operator@ibs2025.com",
        createdAt: new Date()
      },
      {
        userId: "user_2025_003",
        username: "viewer2025",
        passwordHash: await bcrypt.hash('viewer2025!', 12),
        email: "viewer@ibs2025.com",
        createdAt: new Date()
      }
    ]);

    // Seed Sessions with fresh data
    await Sessions.insertMany([
      {
        sessionId: "session_2025_001",
        userId: "user_2025_001",
        deviceId: "device_2025_001",
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
      },
      {
        sessionId: "session_2025_002",
        userId: "user_2025_002",
        deviceId: "device_2025_002",
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
      },
      {
        sessionId: "session_2025_003",
        userId: "user_2025_003",
        deviceId: "device_2025_003",
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
      }
    ]);

    // Seed Screens with fresh multi-monitor setup
    await Screens.insertMany([
      {
        sessionId: "session_2025_001",
        deviceId: "device_2025_001",
        screenId: "0",
        left: 0,
        top: 0,
        width: 2560,
        height: 1440,
        role: "general"
      },
      {
        sessionId: "session_2025_001",
        deviceId: "device_2025_001",
        screenId: "1",
        left: 2560,
        top: 0,
        width: 1920,
        height: 1080,
        role: "detailed"
      },
      {
        sessionId: "session_2025_001",
        deviceId: "device_2025_001",
        screenId: "2",
        left: 4480,
        top: 0,
        width: 1920,
        height: 1080,
        role: "detailed"
      },
      {
        sessionId: "session_2025_002",
        deviceId: "device_2025_002",
        screenId: "0",
        left: 0,
        top: 0,
        width: 1920,
        height: 1080,
        role: "general"
      }
    ]);

    // Seed WidgetPreferences with fresh configurations
    await WidgetPreferences.insertMany([
      {
        userId: "user_2025_001",
        widgetId: "flights-overview",
        priority: "High",
        displayMode: "detailed",
        position: { x: 0, y: 0 },
        size: { width: 400, height: 300 }
      },
      {
        userId: "user_2025_001",
        widgetId: "alerts-panel",
        priority: "High",
        displayMode: "detailed",
        position: { x: 420, y: 0 },
        size: { width: 350, height: 250 }
      },
      {
        userId: "user_2025_001",
        widgetId: "performance-metrics",
        priority: "Medium",
        displayMode: "summary",
        position: { x: 0, y: 320 },
        size: { width: 300, height: 200 }
      },
      {
        userId: "user_2025_002",
        widgetId: "flight-status",
        priority: "High",
        displayMode: "summary",
        position: { x: 0, y: 0 },
        size: { width: 350, height: 250 }
      }
    ]);

    console.log('✅ Fresh data seeded successfully for IBS 2025!');
    console.log('📊 Created:', {
      alerts: '5 new alerts',
      flights: '5 new flights',
      metrics: '10 new KPIs',
      users: '3 new users',
      sessions: '3 new sessions',
      screens: '4 new screen configurations',
      widgets: '4 new widget preferences'
    });
    console.log('🔑 Login credentials:');
    console.log('   - admin2025 / ibs2025!');
    console.log('   - operator2025 / operator2025!');
    console.log('   - viewer2025 / viewer2025!');
    
    mongoose.connection.close();
  } catch (err) {
    console.error('❌ Seeding error:', err);
    mongoose.connection.close();
  }
};

seedData();