//utilities used by multiple modules
var _ = require('lodash');
var mongoose = require('mongoose');
var async = require('async');
var bCrypt = require('bcrypt');
var config = require('../config/config');

//Models
var User = mongoose.model('User');
var DefaultResponseVar = mongoose.model('DefaultResponseVar');
var CustomResponseVar = mongoose.model('CustomResponseVar');
var Counters = mongoose.model('Counters');


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


//NOT IN USE
//convert to object
exports.convertToObjId = function(val) {

	//cast user_id as object to interact with db
	var converted = mongoose.Types.ObjectId(val);

	return converted;

};


/*//LOCAL currently returns data for testing
exports.sendTwilio = function(phone, msg, callback) {
	var data = 'sentTwilio to phone: ' + phone + ', msg: ' + msg;
	console.log('from sentTwilio LOCAL: ', data);
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

//compare for sorting response variables for display
exports.compareResponseVars = function(a, b) {
	console.log('a: ', a);
	console.log('b: ', b);
	if (a.responseStatus < b.responseStatus)
	    return -1;
	if (a.responseStatus > b.responseStatus)
	    return 1;
	return 0;

};


/* -- User Utils -- */

//create custom ResponseVars
exports.createCustomResponseVars = function(data) {

	var r = new CustomResponseVar();
	r.user_id = data.user_id;
	r.responseStatus = data.responseStatus;
	r.body = data.msg;

	if (data.broadcast_id) {
		r.broadcast_id = data.broadcast_id;
	}

	console.log('custom response: ', r);

	r.save(function(err, response) {

		if (err) return err;

		console.log('response SAVED ', response);
		return;

	});

};


/* -- Admin Utils -- */
//create default ResponseVars
exports.createDefaultResponseVars = function(data, res) {

	if (data._id) {

		DefaultResponseVar.findById(data._id, function(err, r) {

			if (err) return res.status(500).send(err);

			r.body = data.body;

			r.save(function(err, r) {

				if (err) return res.status(500).send(err);

				console.log('successfully updated default response var ', r);
				return res.status(200).send('Updated Response Variable!');
			});

		});

	}
	else {

		var r = new DefaultResponseVar();
		r.responseStatus = data.responseStatus;
		r.body = data.body;

		r.save(function(err, r) {

			if (err) return res.status(500).send(err);

			console.log('successfully created default response var ', r);
			return res.status(200).send('Created Response Variable!');
		});
	}


};

// Generates hash using bCrypt
exports.createHash = function(password){
    return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
};


exports.isValidPassword = function(user, password){
    return bCrypt.compareSync(password, user.password);
};


