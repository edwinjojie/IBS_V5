const mongoose = require('mongoose');
const { Schema } = mongoose;

// Alerts Schema
const AlertsSchema = new Schema({
  id: { type: String, required: true, unique: true },
  type: { type: String, required: true },
  severity: { type: String, required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  affectedAirports: { type: [String], default: [] },
  affectedFlights: { type: [String], default: [] },
  timestamp: { type: Date, required: true },
  status: { type: String, required: true },
  source: { type: String, required: true },
  details: { type: Schema.Types.Mixed } // For type-specific fields like estimatedDuration
}, { collection: 'Alerts' });
AlertsSchema.index({ severity: 1, timestamp: 1 });

// Flights Schema
const FlightsSchema = new Schema({
  id: { type: String, required: true, unique: true },
  flight: { type: String, required: true },
  airline: { type: String, required: true },
  route: { type: String, required: true },
  origin: { type: String, required: true },
  destination: { type: String, required: true },
  status: { type: String, required: true },
  scheduled: { type: String, required: true },
  actual: { type: String },
  estimatedArrival: { type: String },
  progress: { type: Number },
  priority: { type: String },
  aircraft: { type: String },
  registration: { type: String },
  passengers: { type: Number },
  capacity: { type: Number },
  gate: { type: String },
  terminal: { type: String },
  crew: {
    captain: { type: String },
    firstOfficer: { type: String }
  },
  weather: { type: String },
  fuel: { type: Number },
  lastUpdate: { type: Date }
}, { collection: 'Flights' });
FlightsSchema.index({ flight: 1, status: 1 });

// Metrics Schema
const MetricsSchema = new Schema({
  kpi_name: { type: String, required: true, unique: true },
  value: { type: Number, required: true },
  change: { type: Number },
  percentage: { type: Number },
  isPositive: { type: Boolean },
  unit: { type: String },
  lastUpdated: { type: Date, required: true }
}, { collection: 'Metrics' });
MetricsSchema.index({ kpi_name: 1, lastUpdated: 1 });

// HistoricalMetrics Schema
const HistoricalMetricsSchema = new Schema({
  time: { type: String, required: true },
  onTime: { type: Number, required: true },
  flights: { type: Number, required: true },
  delays: { type: Number, required: true }
}, { collection: 'HistoricalMetrics' });
HistoricalMetricsSchema.index({ time: 1 });

// Users Schema
const UsersSchema = new Schema({
  userId: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  email: { type: String },
  createdAt: { type: Date, default: Date.now }
}, { collection: 'Users' });
UsersSchema.index({ userId: 1, username: 1 });

// Sessions Schema
const SessionsSchema = new Schema({
  sessionId: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  deviceId: { type: String },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true }
}, { collection: 'Sessions' });
SessionsSchema.index({ userId: 1, sessionId: 1 });

// Screens Schema
const ScreensSchema = new Schema({
  sessionId: { type: String, required: true },
  deviceId: { type: String, required: true },
  screenId: { type: String, required: true },
  left: { type: Number, required: true },
  top: { type: Number, required: true },
  width: { type: Number, required: true },
  height: { type: Number, required: true },
  role: { type: String, required: true, enum: ['general', 'detailed', 'unassigned'], default: 'unassigned' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { collection: 'Screens' });
ScreensSchema.index({ sessionId: 1, deviceId: 1 });
ScreensSchema.index({ sessionId: 1, screenId: 1 });

// WidgetPreferences Schema
const WidgetPreferencesSchema = new Schema({
  userId: { type: String, required: true },
  widgetId: { type: String, required: true },
  priority: { type: String, enum: ['High', 'Medium', 'Low'], default: 'Medium' },
  displayMode: { type: String, enum: ['summary', 'detailed'], default: 'summary' },
  position: {
    x: { type: Number, default: 0 },
    y: { type: Number, default: 0 }
  },
  size: {
    width: { type: Number, default: 300 },
    height: { type: Number, default: 200 }
  }
}, { collection: 'WidgetPreferences' });
WidgetPreferencesSchema.index({ userId: 1, widgetId: 1 });

// Define models
const Alerts = mongoose.model('Alerts', AlertsSchema);
const Flights = mongoose.model('Flights', FlightsSchema);
const Metrics = mongoose.model('Metrics', MetricsSchema);
const HistoricalMetrics = mongoose.model('HistoricalMetrics', HistoricalMetricsSchema);
const Users = mongoose.model('Users', UsersSchema);
const Sessions = mongoose.model('Sessions', SessionsSchema);
const Screens = mongoose.model('Screens', ScreensSchema);
const WidgetPreferences = mongoose.model('WidgetPreferences', WidgetPreferencesSchema);

module.exports = {
  Alerts, Flights, Metrics, HistoricalMetrics, Users, Sessions, Screens, WidgetPreferences
};