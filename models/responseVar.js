var mongoose = require('mongoose');

var responseVarSchema = new mongoose.Schema({

	user_id: {type: String, required: true},
	broadcast_id: [Number],
	response: {type: String, required: true},
	body: {type: String, required: true}

});

mongoose.model('ResponseVar', responseVarSchema);