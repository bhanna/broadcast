var mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
    username: String,
    password: String, //hash created from password
    created_at: {type: Date, default: Date.now}
});

var recipientSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    email: String, 
    created_at: {type: Date, default: Date.now}
});

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


//declare model 'name' which has Schema
mongoose.model('User', userSchema);
mongoose.model('Recipient', recipientSchema);
mongoose.model('Message', messageSchema);