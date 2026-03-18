const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    productName: { type: String, required: true },
    productSize: { type: String },
    pricingType: { type: String, enum: ['per_piece', 'per_kg'], default: 'per_piece' },
    pricePerPiece: { type: Number },
    pricePerKg: { type: Number },
    weightPerItem: { type: Number },
    quantity: { type: Number, required: true, default: 1 },
    gst: { type: Boolean, default: false },
    totalPrice: { type: Number, required: true },
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
