const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey';
const COOKIE_NAME = 'adminSession';
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days in ms

// Production detection — Render/Railway set NODE_ENV=production automatically
const IS_PROD = process.env.NODE_ENV === 'production';

// Cookie options for cross-domain secure auth
const cookieOptions = () => ({
    httpOnly: true,
    secure: IS_PROD,               // true on HTTPS (production), false on localhost
    sameSite: IS_PROD ? 'none' : 'lax', // 'none' required for cross-domain cookies
    maxAge: COOKIE_MAX_AGE,
    path: '/'
});

// Seed default admin if missing
const seedAdmin = async () => {
    const admin = await Admin.findOne();
    if (!admin) {
        const hashedPassword = await bcrypt.hash('Lucky3100@', 10);
        await Admin.create({
            email: 'sandeep.patil3100@gmail.com',
            password: hashedPassword
        });
        console.log('Default admin created');
    } else if (admin.email === 'Sandeep.patil3100@gmail.com') {
        admin.email = 'sandeep.patil3100@gmail.com';
        await admin.save();
        console.log('Admin email updated to lowercase');
    }
};
seedAdmin();

// JWT middleware — reads from HTTP-only cookie
const authMiddleware = (req, res, next) => {
    const token = req.cookies[COOKIE_NAME];
    if (!token) return res.status(401).json({ message: 'Auth token required' });
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.admin = decoded;
        next();
    } catch (err) {
        // Clear expired/invalid cookie
        res.clearCookie(COOKIE_NAME);
        res.status(401).json({ message: 'Session expired. Please login again.' });
    }
};

// POST /admin/login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const admin = await Admin.findOne({ email });
        if (!admin) return res.status(400).json({ message: 'Invalid Email or Password' });

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid Email or Password' });

        const token = jwt.sign({ id: admin._id }, JWT_SECRET, { expiresIn: '7d' });

        // Set HTTP-only cookie
        res.cookie(COOKIE_NAME, token, cookieOptions());

        res.json({ message: 'Login successful' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// POST /admin/logout
router.post('/logout', (req, res) => {
    res.clearCookie(COOKIE_NAME, { path: '/' });
    res.json({ message: 'Logged out successfully' });
});

// GET /admin/verify-session — check if current cookie is valid
router.get('/verify-session', async (req, res) => {
    const token = req.cookies[COOKIE_NAME];
    if (!token) return res.json({ authenticated: false });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const admin = await Admin.findById(decoded.id).select('-password');
        if (!admin) return res.json({ authenticated: false });

        // Rolling session: issue a fresh 7-day token on every visit
        const newToken = jwt.sign({ id: admin._id }, JWT_SECRET, { expiresIn: '7d' });
        res.cookie(COOKIE_NAME, newToken, cookieOptions());

        res.json({ authenticated: true, admin: { email: admin.email } });
    } catch (err) {
        res.clearCookie(COOKIE_NAME, { path: '/' });
        res.json({ authenticated: false });
    }
});

// PUT /admin/update-credentials
router.put('/update-credentials', authMiddleware, async (req, res) => {
    const { currentEmail, currentPassword, newEmail, newPassword } = req.body;
    try {
        const admin = await Admin.findOne({ email: currentEmail });
        if (!admin) return res.status(400).json({ message: 'Current email incorrect' });

        const isMatch = await bcrypt.compare(currentPassword, admin.password);
        if (!isMatch) return res.status(400).json({ message: 'Current password incorrect' });

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        admin.email = newEmail;
        admin.password = hashedPassword;
        await admin.save();

        // Clear old session, force re-login
        res.clearCookie(COOKIE_NAME, { path: '/' });
        res.json({ message: 'Credentials updated. Please login again.' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// GET /admin/me — protected profile route
router.get('/me', authMiddleware, async (req, res) => {
    try {
        const admin = await Admin.findById(req.admin.id).select('-password');
        if (!admin) return res.status(404).json({ message: 'Not found' });
        res.json({ admin });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
