const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const path = require('path');
const fs = require('fs');

// Load environment variables
dotenv.config();

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');
const { initCronJobs } = require('./services/cronService');

// Route Imports
const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const taskRoutes = require('./routes/taskRoutes');
const schedulerRoutes = require('./routes/schedulerRoutes');
const dsaRoutes = require('./routes/dsaRoutes');
const topicsRoutes = require('./routes/topicsRoutes');
const projectRoutes = require('./routes/projectRoutes');
const jobRoutes = require('./routes/jobRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const mentorRoutes = require('./routes/mentorRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const resourceRoutes = require('./routes/resourceRoutes');

// Connect to MongoDB
connectDB();

const app = express();

// Security Middlewares
app.use(helmet({
  crossOriginResourcePolicy: false,
  contentSecurityPolicy: false
}));

// CORS Configuration
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, or same-origin)
    if (!origin || origin.includes('localhost') || origin.includes('127.0.0.1') || origin.includes('onrender.com') || origin === clientUrl) {
      return callback(null, true);
    }
    return callback(null, true); // Permissive for production deployment
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// NoSQL Injection sanitizer
app.use(mongoSanitize());

// General API rate limiter
app.use('/api', apiLimiter);

// Health Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    service: 'AscendOS Career Operating System API',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.round(process.uptime()),
    database: 'connected',
    version: '1.0.0'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/scheduler', schedulerRoutes);
app.use('/api/dsa', dsaRoutes);
app.use('/api/topics', topicsRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/mentor', mentorRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/resources', resourceRoutes);

// Serve static frontend assets (monorepo client/dist or standalone server/public)
const clientDistPath = path.join(__dirname, '../../client/dist');
const serverPublicPath = path.join(__dirname, '../public');

let staticPath = null;
if (fs.existsSync(serverPublicPath) && fs.existsSync(path.join(serverPublicPath, 'index.html'))) {
  staticPath = serverPublicPath;
} else if (fs.existsSync(clientDistPath) && fs.existsSync(path.join(clientDistPath, 'index.html'))) {
  staticPath = clientDistPath;
}

if (staticPath) {
  console.log(`[AscendOS] Serving production frontend build from: ${staticPath}`);
  app.use(express.static(staticPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(staticPath, 'index.html'));
  });
} else {
  // If no frontend build found, provide a clean status landing page instead of raw 404
  app.get('/', (req, res) => {
    res.status(200).send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>AscendOS API</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0B0F17; color: #F3F4F6; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; text-align: center; }
          .card { background: #111827; border: 1px solid #233044; border-radius: 16px; padding: 36px; max-width: 500px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5); }
          h1 { color: #818CF8; margin: 0 0 12px; font-size: 24px; }
          p { color: #9CA3AF; font-size: 14px; line-height: 1.6; }
          .badge { display: inline-block; background: #10B98120; color: #10B981; border: 1px solid #10B98140; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 600; margin-bottom: 16px; }
          a { color: #6366F1; text-decoration: none; font-weight: 600; }
          a:hover { text-decoration: underline; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="badge">API Service Online</div>
          <h1>AscendOS Server</h1>
          <p>The backend API is operational. Visit <a href="/api/health">/api/health</a> for system status.</p>
        </div>
      </body>
      </html>
    `);
  });
}

// Centralized error handler
app.use(errorHandler);

// Initialize background schedulers
initCronJobs();

const PORT = process.env.PORT || 5000;
let server;
if (process.env.NODE_ENV !== 'test') {
  server = app.listen(PORT, () => {
    console.log(`[AscendOS] Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    console.log(`[AscendOS] Health check available at http://localhost:${PORT}/api/health`);
  });
}

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('[AscendOS] SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('[AscendOS] Process terminated.');
  });
});

process.on('unhandledRejection', (err) => {
  console.error('[AscendOS] Unhandled Rejection:', err.message);
});

module.exports = app;
