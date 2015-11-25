//utilities used by multiple modules
var _ = require('lodash');
var mongoose = require('mongoose');
var config = require('../config/config');

//Models
var User = mongoose.model('User');


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