var mongoose = require('mongoose');

var braodcastSchema = new mongoose.Schema({

	//TODO add sender
	to: String,
	header: String,
	body: String,
	created_at: {type: Date, default: Date.now}
	//TODO add received by
		//accepted by
		//confirmed at
		//completed?

});

mongoose.model('Broadcast', braodcastSchema);