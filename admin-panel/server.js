const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const path = require('path');

dotenv.config();
const app = express();

// ── Production CORS Configuration ──
// Auto-strip trailing slashes from FRONTEND_URL to prevent CORS mismatch
const allowedOrigins = [
    process.env.FRONTEND_URL, // e.g. https://shyamsteel.vercel.app
    'http://localhost:5173',  // local Vite dev
    'http://localhost:5000',  // local backend
].filter(Boolean).map(url => url.replace(/\/$/, ''));

app.use(cors({
    origin: function (origin, callback) {
        // allow requests with no origin (mobile apps, curl, etc.)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

// Trust proxy for secure cookies behind Render/Railway reverse proxy
app.set('trust proxy', 1);

app.use(express.json());
app.use(cookieParser());

// Routes
const adminRoutes = require('./routes/admin');
const orderRoutes = require('./routes/orders');
const suggestionRoutes = require('./routes/suggestions');

app.use('/admin', adminRoutes);
app.use('/orders', orderRoutes);
app.use('/suggestions', suggestionRoutes);

// Health check endpoint (for Render/Railway)
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/admin-dashboard';

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('✅ MongoDB connected');
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });
    })
    .catch(err => console.log('❌ MongoDB connection error:', err));
