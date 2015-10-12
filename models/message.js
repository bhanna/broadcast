var mongoose = require('mongoose');

var messageSchema = new mongoose.Schema({

	//TODO add sender
	to: String,
	title: String,
	body: String,
	created_at: {type: Date, default: Date.now}
	//TODO add received by
		//accepted by
		//confirmed at
		//completed?

});

mongoose.model('Message', messageSchema);