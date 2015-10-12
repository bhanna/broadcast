var mongoose = require('mongoose');

var recipientSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    email: String, 
    created_at: {type: Date, default: Date.now}
});

mongoose.model('Recipient', recipientSchema);