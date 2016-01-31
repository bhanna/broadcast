var mongoose = require('mongoose');
var utils = require('./utils');

var BroadcastCounter = mongoose.model('BroadcastCounter');
var Counters = mongoose.model('Counters');

//user
var userSchema = new mongoose.Schema({

    //TODO implement user_counter for user_id to remove the convertToObj()
    user_id: {type: Number}, 
    email: {type: String, required: true},
    password: {type: String, required: true}, 
    created_at: {type: Date, default: Date.now},
    role: {type: String, required: true},

});

//create new Counter each User
//create non-object user_id
//TODO NEEDS TESTING
userSchema.pre('save', function(next) {

	if (!this.isNew) {
		return next();
	}
		
	var doc = this;
    console.log('user presave ', this);

    //var conditions = { type: 'user_id' };
    //var update = { $inc: { seq: 1}};
    //var options = { 'new': true };

    console.log('reached presave user');

    utils.getNextSequence('user_id', function(user_id) {

        doc.user_id = user_id;
        console.log('user_id: ', doc.user_id);
        
    });
    

    var broadcastCounter = new BroadcastCounter();

    broadcastCounter.user_id = doc.user_id;
    broadcastCounter.save(function(err) {

        if (err) return next(err);
        return next();

    });


    /*
    //Counters.update({_id: user_id}, {$inc: { seq: 1}}, {'new': true}, function(err, counter) {
    //Counters.update(conditions, update, options, function(err, counter) {

        if (err) {
            console.log('failed to find Counters');
            return next(err);
        }
        
        console.log('user counter: ', counter);
        doc.user_id = counter.seq;
        console.log('new user_id: ', doc.user_id);
        var broadcastCounter = new BroadcastCounter();

        broadcastCounter.user_id = doc._id;
        broadcastCounter.save(function(err) {

            if (err) return next(err);
            return next();

        });

    });
    */

    

});

mongoose.model('User', userSchema);