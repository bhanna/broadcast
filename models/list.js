var mongoose = require('mongoose');

//list
var listSchema = new mongoose.Schema({

	user_ids: [{ type : Number, ref: 'User' }],
	listName: {type: String, required: true},
	listDesc: String

	//TODO add a user_id to associate rather than keep as a subdoc

});

mongoose.model('List', listSchema);