var mongoose = require('mongoose');


//response from Recipient and auto response in broadcastThread
var responseSchema = new mongoose.Schema({

	body: {type: String, required: true},
	created_at: {type: Date, default: Date.now}

});


//broadcastThread (for individual broadcast thread as subdoc in broadcast)
var broadcastThreadSchema = new mongoose.Schema({

	//TODO add sender?
	//initially send custom message
	//use broadcast_id to associate with Broadcast
	broadcast_id: {type: Number, required: true},
	firstName: {type: String, required: true},
	phone: {type: String, required: true},
	status: {type: String, required: true, default: 'Pending'},
	conversation: [responseSchema], //TODO configure this
	created_at: {type: Date, default: Date.now}

});

mongoose.model('Response', responseSchema);
mongoose.model('BroadcastThread', broadcastThreadSchema);
