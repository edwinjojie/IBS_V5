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

    // Seed Alerts
    await Alerts.insertMany([
      {
        id: "alert_001",
        type: "weather",
        severity: "high",
        title: "Severe Thunderstorm Warning",
        message: "Severe thunderstorms with heavy rain and strong winds expected at JFK Airport between 15:00-19:00 EST. Flight delays and cancellations likely.",
        affectedAirports: ["JFK", "LGA"],
        affectedFlights: ["AA1234", "DL2468", "UA5790"],
        timestamp: new Date("2025-08-05T14:25:00Z"),
        status: "active",
        source: "National Weather Service",
        details: { estimatedDuration: "4 hours", recommendations: "Consider rerouting flights, prepare for ground delays" }
      },
      {
        id: "alert_002",
        type: "security",
        severity: "medium",
        title: "Security Checkpoint Delay",
        message: "Increased security checks at LAX causing delays at Terminal 4.",
        affectedAirports: ["LAX"],
        affectedFlights: ["AA5678"],
        timestamp: new Date("2025-08-05T13:45:00Z"),
        status: "active",
        source: "TSA",
        details: { estimatedDelay: "30 minutes" }
      },
      {
        id: "alert_003",
        type: "weather",
        severity: "low",
        title: "Fog Advisory",
        message: "Light fog at ORD may cause minor delays.",
        affectedAirports: ["ORD"],
        affectedFlights: ["DL5678"],
        timestamp: new Date("2025-08-05T12:00:00Z"),
        status: "active",
        source: "National Weather Service",
        details: { visibility: "2 miles" }
      }
    ]);

    // Seed Flights
    await Flights.insertMany([
      {
        id: "1",
        flight: "AA1234",
        airline: "American Airlines",
        route: "JFK → LAX",
        origin: "JFK",
        destination: "LAX",
        status: "On Time",
        scheduled: "2025-08-05T14:30:00Z",
        actual: "2025-08-05T14:32:00Z",
        estimatedArrival: "2025-08-05T17:45:00Z",
        progress: 85,
        priority: "high",
        aircraft: "Boeing 737-800",
        registration: "N123AA",
        passengers: 156,
        capacity: 189,
        gate: "A12",
        terminal: "Terminal 4",
        crew: { captain: "John Smith", firstOfficer: "Sarah Johnson" },
        weather: "Clear",
        fuel: 85,
        lastUpdate: new Date("2025-08-05T14:32:00Z")
      },
      {
        id: "2",
        flight: "DL5678",
        airline: "Delta Air Lines",
        route: "ATL → ORD",
        origin: "ATL",
        destination: "ORD",
        status: "Delayed",
        scheduled: "2025-08-05T16:45:00Z",
        actual: "2025-08-05T17:15:00Z",
        estimatedArrival: "2025-08-05T19:30:00Z",
        progress: 60,
        priority: "medium",
        aircraft: "Airbus A320",
        registration: "N456DL",
        passengers: 142,
        capacity: 180,
        gate: "B8",
        terminal: "Terminal 2",
        crew: { captain: "Michael Brown", firstOfficer: "Lisa Davis" },
        weather: "Light Rain",
        fuel: 78,
        lastUpdate: new Date("2025-08-05T16:45:00Z")
      },
      {
        id: "3",
        flight: "UA5790",
        airline: "United Airlines",
        route: "SFO → DEN",
        origin: "SFO",
        destination: "DEN",
        status: "On Time",
        scheduled: "2025-08-05T09:00:00Z",
        actual: "2025-08-05T09:00:00Z",
        estimatedArrival: "2025-08-05T11:30:00Z",
        progress: 100,
        priority: "low",
        aircraft: "Boeing 737-900",
        registration: "N789UA",
        passengers: 170,
        capacity: 200,
        gate: "G9",
        terminal: "Terminal 3",
        crew: { captain: "Robert Wilson", firstOfficer: "Emily Clark" },
        weather: "Clear",
        fuel: 90,
        lastUpdate: new Date("2025-08-05T09:00:00Z")
      }
    ]);

    // Seed Metrics
    await Metrics.insertMany([
      {
        kpi_name: "flightsToday",
        value: 247,
        change: 12,
        percentage: 5.1,
        isPositive: true,
        lastUpdated: new Date("2025-08-05T18:30:00Z")
      },
      {
        kpi_name: "delays",
        value: 18,
        change: -3,
        percentage: -14.3,
        isPositive: true,
        lastUpdated: new Date("2025-08-05T18:30:00Z")
      },
      {
        kpi_name: "onTimePerformance",
        value: 92.7,
        change: 2.1,
        percentage: 2.3,
        isPositive: true,
        lastUpdated: new Date("2025-08-05T18:30:00Z")
      },
      {
        kpi_name: "cancellations",
        value: 5,
        change: 1,
        percentage: 25,
        isPositive: false,
        lastUpdated: new Date("2025-08-05T18:30:00Z")
      }
    ]);

    // Seed HistoricalMetrics
    await HistoricalMetrics.insertMany([
      { time: "2025-08-05T06:00:00Z", onTime: 95, flights: 12, delays: 1 },
      { time: "2025-08-05T08:00:00Z", onTime: 88, flights: 24, delays: 3 },
      { time: "2025-08-05T10:00:00Z", onTime: 90, flights: 30, delays: 2 },
      { time: "2025-08-05T12:00:00Z", onTime: 85, flights: 28, delays: 4 }
    ]);

    // Seed Users
    const passwordHash = await bcrypt.hash('test123', 10);
    await Users.insertMany([
      {
        userId: "u1",
        username: "testuser",
        passwordHash,
        email: "testuser@example.com",
        createdAt: new Date()
      },
      {
        userId: "u2",
        username: "adminuser",
        passwordHash: await bcrypt.hash('admin123', 10),
        email: "admin@example.com",
        createdAt: new Date()
      }
    ]);

    // Seed Sessions
    await Sessions.insertMany([
      {
        sessionId: "s1",
        userId: "u1",
        deviceId: "device1",
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
      },
      {
        sessionId: "s2",
        userId: "u2",
        deviceId: "device2",
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
      }
    ]);

    // Seed Screens
    await Screens.insertMany([
      {
        userId: "u1",
        sessionId: "s1",
        screenId: "screen1",
        role: "general"
      },
      {
        userId: "u1",
        sessionId: "s1",
        screenId: "screen2",
        role: "detailed"
      },
      {
        userId: "u2",
        sessionId: "s2",
        screenId: "screen3",
        role: "general"
      }
    ]);

    // Seed WidgetPreferences
    await WidgetPreferences.insertMany([
      {
        userId: "u1",
        widgetId: "flights-today",
        priority: "High",
        displayMode: "summary",
        position: { x: 0, y: 0 },
        size: { width: 300, height: 200 }
      },
      {
        userId: "u1",
        widgetId: "alerts-panel",
        priority: "Medium",
        displayMode: "detailed",
        position: { x: 320, y: 0 },
        size: { width: 300, height: 200 }
      },
      {
        userId: "u2",
        widgetId: "delays",
        priority: "High",
        displayMode: "summary",
        position: { x: 0, y: 0 },
        size: { width: 300, height: 200 }
      }
    ]);

    console.log('Data seeded successfully');
    mongoose.connection.close();
  } catch (err) {
    console.error('Seeding error:', err);
    mongoose.connection.close();
  }
};

seedData();