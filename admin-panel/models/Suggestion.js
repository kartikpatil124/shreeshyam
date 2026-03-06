const mongoose = require('mongoose');

const suggestionSchema = new mongoose.Schema({
    productNames: { type: [String], default: [] },
    productSizes: { type: [String], default: [] },
    partyNames: { type: [String], default: [] }
});

module.exports = mongoose.model('Suggestion', suggestionSchema);
