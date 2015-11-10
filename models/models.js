var express = require('express');
var mongoose = require('mongoose');

//TODO add dynamic models from user generated content/preferences

/*
//auto increment 
//used in broadcast to differentiate between responses to broadcasts 
//TODO add new Counter for each User!
var counterSchema = new mongoose.Schema({
    
    user_id: { type : mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    seq: { type: Number, default: 0 }

});

var Counter = mongoose.model('Counter', counterSchema);
*/
/*
//response from Recipient and auto response in broadcastThread
var responseSchema = new mongoose.Schema({

	body: {type: String, required: true},
	created_at: {type: Date, default: Date.now}

});
*/
/*
//broadcastThread (for individual broadcast thread as subdoc in broadcast)
var broadcastThreadSchema = new mongoose.Schema({

	//TODO add sender?
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
*/
/*
//broadcast (list for individual broadcast threads)
var broadcastSchema = new mongoose.Schema({

	//user_ids: [{ type : mongoose.Types.ObjectId, ref: 'User', required: true }],
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

	if (!this.isNew) {
		return next();
	}
	
    var doc = this;
    Counter.findByIdAndUpdate({_id: 'broadcast_id'}, {$inc: { seq: 1} }, function(error, counter)   {
        if(error)
            return next(error);
        doc.broadcast_id = counter.seq;
        doc.body = doc.body + ' Yes' + doc.broadcast_id + ' or No' + doc.broadcast_id;
        next();
    });
});
*/
/*
//recipient
var recipientSchema = new mongoose.Schema({

	//TODO add a user_id to associate with User in case Recipient is removed from all Lists
	//user_ids: [{ type : mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
	list_ids: [{ type : mongoose.Schema.Types.ObjectId, ref: 'List', required: true }],
    firstName: {type: String, required: true},
    email: String,
    phone: {type: String, required: true},
    created_at: {type: Date, default: Date.now}

});
*/
/*
//list
var listSchema = new mongoose.Schema({

	//user_ids: [{ type : mongoose.Schema.Types.ObjectId, ref: 'User' }],
	listName: {type: String, required: true},
	listDesc: String

	//TODO add a user_id to associate rather than keep as a subdoc

});
*/
/*
//user
var userSchema = new mongoose.Schema({
    username: {type: String, required: true},
    password: {type: String, required: true}, 
    created_at: {type: Date, default: Date.now},
    //role: {type: String, required: true},
  	//lists: [{ type : mongoose.Schema.Types.ObjectId, ref: 'List' }],
  	//broadcasts: [{ type : mongoose.Schema.Types.ObjectId, ref: 'Broadcast' }]

  	//TODO add role for user vs admin
});

//create new Counter each User
userSchema.pre('save', function(next) {

	if (!this.isNew) {
		return next();
	}
		
	var doc = this;

    var counter = new Counter();

    counter.user_id = doc._id;
    counter.save(function(err) {

    	if (err) return next(err);
    	return next();

    });

});
*/

//mongoose.model('BroadcastThread', broadcastThreadSchema);
//mongoose.model('Response', responseSchema);
//mongoose.model('Broadcast', broadcastSchema);
//mongoose.model('Recipient', recipientSchema);
//mongoose.model('User', userSchema);
//mongoose.model('List', listSchema);