var mongoose = require('mongoose');

var recipientSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    email: {type: String, required: true },
    phone: {type: String, required: true },
    created_at: {type: Date, default: Date.now}
});

mongoose.model('Recipient', recipientSchema);