const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Alerts, Flights, Metrics, HistoricalMetrics, Users, Sessions, Screens, WidgetPreferences } = require('./models');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.error('MongoDB connection error:', err));

const JWT_SECRET = process.env.JWT_SECRET || "your-secure-random-string-12345";

// --- AUTH ENDPOINTS ---

// Login: POST /api/login
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await Users.findOne({ username });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ message: "Invalid credentials" });
    const token = jwt.sign({ userId: user.userId, username: user.username }, JWT_SECRET, { expiresIn: "2h" });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Verify: GET /api/verify
app.get('/api/verify', (req, res) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) return res.status(401).json({ message: "No token" });
  const token = auth.split(" ")[1];
  try {
    jwt.verify(token, JWT_SECRET);
    res.json({ ok: true });
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
});

// API Endpoints
app.get('/api/flights', async (req, res) => {
  try {
    const flights = await Flights.find();
    res.json(flights);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/flights/:id', async (req, res) => {
  try {
    const flight = await Flights.findOne({ id: req.params.id });
    if (!flight) return res.status(404).json({ error: 'Flight not found' });
    res.json(flight);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/flights/status/:status', async (req, res) => {
  try {
    const flights = await Flights.find({ status: req.params.status });
    res.json(flights);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/flights/airport/:airport', async (req, res) => {
  try {
    const flights = await Flights.find({ $or: [{ origin: req.params.airport }, { destination: req.params.airport }] });
    res.json(flights);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/flights/search', async (req, res) => {
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
});

app.get('/api/alerts', async (req, res) => {
  try {
    const alerts = await Alerts.find().sort({ timestamp: -1 });
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/alerts/active', async (req, res) => {
  try {
    const alerts = await Alerts.find({ status: 'active' }).sort({ timestamp: -1 });
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/alerts/type/:type', async (req, res) => {
  try {
    const alerts = await Alerts.find({ type: req.params.type });
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/alerts/severity/:severity', async (req, res) => {
  try {
    const alerts = await Alerts.find({ severity: req.params.severity });
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/alerts/flight/:flightNumber', async (req, res) => {
  try {
    const alerts = await Alerts.find({ affectedFlights: req.params.flightNumber });
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/metrics', async (req, res) => {
  try {
    const metrics = await Metrics.find();
    const formattedMetrics = metrics.reduce((acc, metric) => {
      acc[metric.kpi_name] = {
        value: metric.value,
        change: metric.change,
        percentage: metric.percentage,
        isPositive: metric.isPositive,
        unit: metric.unit,
        lastUpdated: metric.lastUpdated
      };
      return acc;
    }, {});
    res.json(formattedMetrics);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/historical-metrics', async (req, res) => {
  try {
    const data = await HistoricalMetrics.find().sort({ time: 1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- SCREEN MANAGEMENT ENDPOINTS ---

// Link device to session and store screen coordinates: POST /api/screens/link
app.post('/api/screens/link', async (req, res) => {
  try {
    const { sessionId, deviceId, screenId, left, top, width, height, role } = req.body;
    
    // Check if screen already exists for this device and session
    const existingScreen = await Screens.findOne({ 
      sessionId, 
      deviceId, 
      screenId 
    });

    if (existingScreen) {
      // Update existing screen
      existingScreen.left = left;
      existingScreen.top = top;
      existingScreen.width = width;
      existingScreen.height = height;
      existingScreen.role = role || existingScreen.role;
      existingScreen.updatedAt = new Date();
      await existingScreen.save();
    } else {
      // Create new screen
      const newScreen = new Screens({
        sessionId,
        deviceId,
        screenId,
        left,
        top,
        width,
        height,
        role: role || 'unassigned'
      });
      await newScreen.save();
    }

    res.json({ success: true, message: 'Screen linked successfully' });
  } catch (err) {
    console.error('Screen link error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Assign role to a specific screen: POST /api/screens/role
app.post('/api/screens/role', async (req, res) => {
  try {
    const { sessionId, deviceId, screenId, role } = req.body;
    
    if (!['general', 'detailed', 'unassigned'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role. Must be general, detailed, or unassigned' });
    }

    const screen = await Screens.findOneAndUpdate(
      { sessionId, deviceId, screenId },
      { role, updatedAt: new Date() },
      { new: true, upsert: true }
    );

    res.json({ success: true, message: 'Role assigned successfully', screen });
  } catch (err) {
    console.error('Role assignment error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get all screens for a specific session: GET /api/screens/session/:sessionId
app.get('/api/screens/session/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const screens = await Screens.find({ sessionId }).sort({ screenId: 1 });
    res.json(screens);
  } catch (err) {
    console.error('Get screens error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get screen information for a specific device and session: GET /api/screens/device/:deviceId/session/:sessionId
app.get('/api/screens/device/:deviceId/session/:sessionId', async (req, res) => {
  try {
    const { deviceId, sessionId } = req.params;
    const screens = await Screens.find({ deviceId, sessionId }).sort({ screenId: 1 });
    res.json(screens);
  } catch (err) {
    console.error('Get device screens error:', err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));