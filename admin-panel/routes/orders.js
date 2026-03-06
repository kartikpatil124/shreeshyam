const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

// Middleware mockup - assuming handled in index or router use later
// We will just use it directly for simplicity if auth was global, but let's keep it simple for MVP

// Create
router.post('/create', async (req, res) => {
    try {
        const order = new Order(req.body);
        await order.save();
        res.status(201).json(order);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Get pending
router.get('/pending', async (req, res) => {
    try {
        const orders = await Order.find({ status: 'pending' }).sort({ orderDate: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get completed
router.get('/completed', async (req, res) => {
    try {
        const orders = await Order.find({ status: 'completed' }).sort({ orderDate: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Search
router.get('/search', async (req, res) => {
    const query = req.query.query;
    try {
        const searchRegex = new RegExp(query, 'i');
        // Search by Product Name, Size or exact Price
        const priceQuery = !isNaN(query) ? Number(query) : null;

        let conditions = [
            { partyName: searchRegex },
            { 'products.productName': searchRegex },
            { 'products.productSize': searchRegex }
        ];

        if (priceQuery !== null) {
            conditions.push({ totalAmount: priceQuery });
            conditions.push({ 'products.price': priceQuery });
        }

        const orders = await Order.find({ $or: conditions });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Filter
router.get('/filter', async (req, res) => {
    const { startDate, endDate } = req.query;
    try {
        let query = {};
        if (startDate && endDate) {
            query.orderDate = { $gte: new Date(startDate), $lte: new Date(endDate) };
        }
        const orders = await Order.find(query);
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Statistics
router.get('/statistics', async (req, res) => {
    try {
        const total = await Order.countDocuments();
        const pending = await Order.countDocuments({ status: 'pending' });
        const completed = await Order.countDocuments({ status: 'completed' });

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const dueToday = await Order.countDocuments({
            dueDate: { $gte: today, $lt: tomorrow },
            status: 'pending'
        });

        const overdue = await Order.countDocuments({
            dueDate: { $lt: today },
            status: 'pending'
        });

        // Month trend roughly
        const last30Days = new Date();
        last30Days.setDate(today.getDate() - 30);

        const recentOrders = await Order.find({ orderDate: { $gte: last30Days } });

        res.json({
            total,
            pending,
            completed,
            dueToday,
            overdue,
            recentOrders
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update
router.put('/update/:id', async (req, res) => {
    try {
        const order = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(order);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Complete marking
router.put('/complete/:id', async (req, res) => {
    try {
        const order = await Order.findByIdAndUpdate(req.params.id, { status: 'completed' }, { new: true });
        res.json(order);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete
router.delete('/delete/:id', async (req, res) => {
    try {
        await Order.findByIdAndDelete(req.params.id);
        res.json({ message: 'Order deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
