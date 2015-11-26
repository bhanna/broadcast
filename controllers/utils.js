//utilities used by multiple modules
var _ = require('lodash');
var mongoose = require('mongoose');
var async = require('async');
var config = require('../config/config');

//Models
var User = mongoose.model('User');
var ResponseVar = mongoose.model('ResponseVar');


//twilio
var client = require('twilio')(config.TWILIO_ACCOUNT_SID, config.TWILIO_AUTH_TOKEN);

exports.belongsToUser = function(model, query, user_id) {

	model.find(query, function(err, model) {

		if (err) return 'err at belongsToUser ', err;

		if ( _.some(model.user_ids, user_id) ) {

			return 'yes';

		}
		else {

			return 'no';

		}

	});

};


//convert to object
exports.convertToObj = function(val) {

	//cast user_id as object to interact with db
	var converted = mongoose.Types.ObjectId(val);

	return converted;

};

/*//LOCAL currently returns data for testing
exports.sendTwilio = function(phone, msg, callback) {
	var data = 'sentTwilio to phone: ' + phone + ', msg: ' + msg;
	console.log('from sentTwilio: ', data);
	callback();
};*/

//LIVE
exports.sendTwilio = function (phone, msg, callback) {

	//TWILIO SEND
	client.messages.create({
		to: phone,
	    from: config.TWILIO_NUMBER,
	    body: msg
	    //mediaUrl: "http://www.example.com/hearts.png"
	}, function(err, message) {
		if (err) {
			console.log('error at Twilio ', err);
			//return res.status(500).send(err);
			callback(err);
			return;
		}
	    console.log('message ', message);
	    callback();
	    //return;
	    //process.stdout.write(message.sid);
	});

};

//check if Admin
//not in use yet
exports.isAdmin = function (id) {

	//turn into object
	id = convertToObj(id);

	User.findById(id, function(err, user) {

		if (err) return err;
		if (user.role === 'admin') {
			return true;
		}
		return false;

	});

};


//create default ResponseVars
exports.createDefaultResponseVars = function(user_id) {

	async.each(config.responses, function(response, callback) {

		var r = new ResponseVar();
		r.user_id = user_id;
		r.responseStatus = response;

		if (response === 'Owner Declined') {

			r.title = 'declined';
			r.body = 'The position is no longer available.  Thank you!';
		}
		else if (response === 'Owner Cancelled') {

			r.title = 'cancelled';
			r.body = 'Oh no, the creator of this job has cancelled it.  We\'re sorry for any inconvenience.';
		
		}
		else if (response === 'Accepted') {	

			r.title = 'accpeted';
			//NOTE: requires broadcast_id to be added at the end
			r.body = 'You have been selected to fill the position. To secure your spot, please reply Confirm';
		
		}
		else if (response === 'Reopened') {

			r.title = 'reopened';
			//NOTE: requires broadcast_id to be added at the end
			r.body = 'This position has been reopened. To secure your spot please reply Confirm';
		
		}
		else if (response === 'newPosition') {

			r.title = 'newPosition';
			//NOTE: requires 'Yesbroadcast_id or Nobroadcast_id?' to be added at the end
			r.body = 'A position has opened up!  Are you still available?';
		
		}
		else if (response === 'filled') {

			r.title = 'filled';
			r.body = 'All positions have been filled';
		
		}

		r.save(function(err, r) {

			if (err) callback(err);

			console.log('successfully created default response var ', r.responseStatus);
			callback();
		});

	}, function (err) {

		if (err) return err;
		return;

	});


};


//TODO create custom ResponseVars

