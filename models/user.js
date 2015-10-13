var mongoose = require('mongoose');

var Recipient = mongoose.model('Recipient');

var Broadcast = mongoose.model('Broadcast');

var listSchema = new mongoose.Schema({

	listName: {type: String, required: true},
	listItems: [Recipient]

});

var userSchema = new mongoose.Schema({
    username: {type: String, required: true},
    password: {type: String, required: true}, 
    created_at: {type: Date, default: Date.now},
    broadcasts: [broadcastSchema],
    lists: [listSchema]
});

mongoose.model('User', userSchema);