var express = require('express');
var mongoose = require('mongoose');

//TODO learn about embedded docs
//and dynamic models from user generated content/preferences

//TODO add [broadcastSchema] to a Conversation model to track responses in Mongo

//broadcast
var broadcastSchema = new mongoose.Schema({

	//TODO add sender
	//initially concat message from chosen fields.
	//this allows the user to eventually add or remove fields in a Broadcast
	to: {type: String, required: true},
	body: {type: String, required: true},
	numPositions: {type: Number, required: true}, //Needed for filling positions
	openPositions: {type: Number, required: true}, //Needed to track filled positions
	created_at: {type: Date, default: Date.now}
	/*
	to: {type: String, required: true},
	time: {type: String, required: true},
	date: {type: String, required: true}, //TODO format date input with selects...
	location: {type: String, required: true}, //TODO separate fields in HTML and concat for model storage
	pay: {type: String, required: true},
	numPositions: {type: Number, required: true},
	created_at: {type: Date, default: Date.now}
	*/
	//TODO add received by
		//accepted by
		//confirmed at
		//completed?

});


//response from Recipient and auto response from Broadcast
var responseSchema = new mongoose.Schema({

	broadcastID: String,
	body: String,
	created_at: {type: Date, default: Date.now}

});


//recipient
var recipientSchema = new mongoose.Schema({
    firstName: String,
    email: String,
    phone: String,
    created_at: {type: Date, default: Date.now}
});


//list
var listSchema = new mongoose.Schema({

	listName: {type: String, required: true},
	listDesc: String,
	listItems: [recipientSchema]

});


//user
var userSchema = new mongoose.Schema({
    username: {type: String, required: true},
    password: {type: String, required: true}, 
    created_at: {type: Date, default: Date.now},
    broadcasts: [broadcastSchema],
    convesrations: [responseSchema], //TODO configure this
    lists: [listSchema]
});

mongoose.model('Broadcast', broadcastSchema);
mongoose.model('Recipient', recipientSchema);
mongoose.model('User', userSchema);
mongoose.model('List', listSchema);