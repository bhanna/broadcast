var mongoose = require('mongoose');

//recipient
var recipientSchema = new mongoose.Schema({

	user_ids: [{ type : Number, ref: 'User', required: true }],
	list_ids: [{ type : mongoose.Schema.Types.ObjectId, ref: 'List', required: true }],
    firstName: {type: String, required: true},
    email: String,
    phone: {type: String, required: true},
    roles: { type : Array , "default" : [] },
    created_at: {type: Date, default: Date.now}

});

mongoose.model('Recipient', recipientSchema);