//utilities used by models
var _ = require('lodash');
var mongoose = require('mongoose');
var async = require('async');

var Counters = mongoose.model('Counters');

//auto-incrementor
exports.getNextSequence = function(type, callback) {
	
	Counters.findOneAndUpdate(
        { type: type },
        { $inc: { seq: 1 } },
        {new: true}, 
        function(err, counter) {

        	if (err) return err;

        	console.log('counter.seq ', counter.seq );
   			//return counter.seq;
   			callback(counter.seq);

        });
	

};