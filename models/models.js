var express = require('express');
var mongoose = require('mongoose');

//TODO add dynamic models from user generated content/preferences


//auto increment 
//used in broadcast to differentiate between responses to broadcasts 
var counterSchema = new mongoose.Schema({
    _id: {type: String, required: true},
    seq: { type: Number, default: 0 }
});

var Counter = mongoose.model('counter', counterSchema);

//response from Recipient and auto response in broadcastThread
var responseSchema = new mongoose.Schema({

	//broadcastID: {type: String, required: true},
	body: {type: String, required: true},
	created_at: {type: Date, default: Date.now}

});


//broadcastThread (for individual broadcast thread as subdoc in broadcast)
var broadcastThreadSchema = new mongoose.Schema({

	//TODO add sender
	//initially concat message from chosen fields.
	//this allows the user to eventually add or remove fields in a Broadcast
	//use broadcast_id to associate with Broadcast
	broadcast_id: {type: Number, required: true},
	firstName: {type: String, required: true},
	phone: {type: String, required: true},
	status: {type: String, required: true, default: 'Pending'},
	conversation: [responseSchema], //TODO configure this
	created_at: {type: Date, default: Date.now}

});

//broadcast (list for individual broadcast threads)
var broadcastSchema = new mongoose.Schema({

	broadcast_id: {type: Number},
	title: {type: String, required: true},
	body: {type: String, required: true},
	numPositions: {type: Number, required: true}, //Needed for filling positions
	openPositions: {type: Number, required: true}, //Needed to track filled positions
	listID: String,
	created_at: {type: Date, default: Date.now}

	//TODO add a user_id to associate rather than keep as a subdoc

});

//auto increment jobs
broadcastSchema.pre('save', function(next) {
    var doc = this;
    Counter.findByIdAndUpdate({_id: 'broadcast_id'}, {$inc: { seq: 1} }, function(error, counter)   {
        if(error)
            return next(error);
        doc.broadcast_id = counter.seq;
        next();
    });
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
    //broadcasts: [broadcastSchema],
    lists: [listSchema]
});


mongoose.model('BroadcastThread', broadcastThreadSchema);
mongoose.model('Response', responseSchema);
mongoose.model('Broadcast', broadcastSchema);
mongoose.model('Recipient', recipientSchema);
mongoose.model('User', userSchema);
mongoose.model('List', listSchema);