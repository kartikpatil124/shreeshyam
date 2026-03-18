const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    productName: { type: String, required: true },
    productSize: { type: String },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, default: 1 },
    priceType: { type: String, enum: ['pieces', 'kg'], default: 'pieces' },
    gst: { type: Boolean, default: false },
    finalPrice: { type: Number, required: true },
    description: { type: String }
});

const orderSchema = new mongoose.Schema({
    partyName: { type: String, required: true },
    products: [orderItemSchema],
    totalAmount: { type: Number, required: true, default: 0 },
    orderDate: { type: Date, required: true },
    dueDate: { type: Date, required: true },
    status: { type: String, enum: ['pending', 'completed'], default: 'pending' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);
