const express = require('express');
const router = express.Router();
const Suggestion = require('../models/Suggestion');

// Helper to get exactly one suggestion doc
async function getDoc() {
    let doc = await Suggestion.findOne();
    if (!doc) doc = await Suggestion.create({ productNames: [], productSizes: [] });
    return doc;
}

router.get('/products', async (req, res) => {
    try {
        const doc = await getDoc();
        res.json(doc.productNames);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/sizes', async (req, res) => {
    try {
        const doc = await getDoc();
        res.json(doc.productSizes);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/parties', async (req, res) => {
    try {
        const doc = await getDoc();
        res.json(doc.partyNames || []);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/add-product', async (req, res) => {
    try {
        const { productName } = req.body;
        const doc = await getDoc();
        if (!doc.productNames.includes(productName)) {
            doc.productNames.push(productName);
            await doc.save();
        }
        res.json(doc.productNames);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/add-size', async (req, res) => {
    try {
        const { productSize } = req.body;
        const doc = await getDoc();
        if (!doc.productSizes.includes(productSize)) {
            doc.productSizes.push(productSize);
            await doc.save();
        }
        res.json(doc.productSizes);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/add-party', async (req, res) => {
    try {
        const { partyName } = req.body;
        const doc = await getDoc();
        if (!doc.partyNames) doc.partyNames = [];
        if (!doc.partyNames.includes(partyName)) {
            doc.partyNames.push(partyName);
            await doc.save();
        }
        res.json(doc.partyNames);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
