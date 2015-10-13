var express = require('express');
var mongoose = require('mongoose');

//TODO learn about embedded docs
//and dynamic models from user generated content/preferences

//message
var broadcastSchema = new mongoose.Schema({

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


//recipient
var recipientSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    email: {type: String, required: true },
    phone: {type: String, required: true },
    created_at: {type: Date, default: Date.now}
});


//list
var listSchema = new mongoose.Schema({

	listName: {type: String, required: true},
	listItems: [recipientSchema]

});


//user
var userSchema = new mongoose.Schema({
    username: {type: String, required: true},
    password: {type: String, required: true}, 
    created_at: {type: Date, default: Date.now},
    broadcasts: [broadcastSchema],
    lists: [listSchema]
});

mongoose.model('Broadcast', broadcastSchema);
mongoose.model('Recipient', recipientSchema);
mongoose.model('User', userSchema);
mongoose.model('List', listSchema);