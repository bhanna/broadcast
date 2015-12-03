var express = require('express');
var mongoose = require( 'mongoose' );
var async = require('async');
var config = require('../config/config');
var utils = require('./utils');

var app = require('../app'); 


var incoming = require('./utils.incoming');


var Broadcast = mongoose.model('Broadcast');
var BroadcastThread = mongoose.model('BroadcastThread');
var Response = mongoose.model('Response');
var List = mongoose.model('List');
var Recipient = mongoose.model('Recipient');


var router =  express.Router();

// Set Content-Type response header and render XML (TwiML) response in a 
// Jade template - sends a text message back to user


// Twilio SMS webhook route

module.exports = function(io) {

router.route('/')
	.post(function(req, res) {


			//get phone number
			var phone = req.body.From;
		    console.log('response from client: ', phone);

		    //TODO make this clean!
		   	//get msg
		    var msg = req.body.Body || '';
	        msg = msg.toLowerCase().trim();
	        console.log('msg: ', msg);

	        //get broadcast_id from msg
	        //TODO make cleaner parse so that there isn't a chance of joining an actual broadcast id
	        //maybe find "yes#" or "no#" and then match \d 
			broadcast_id = msg.match(/\d/g);

			console.log('BROADCAST ID ', broadcast_id);

			app.io.on('connection', function(socket) {

				console.log('SOCKET REACHED INCOMING');

			});

			//no numbers
			if (!broadcast_id) {

				console.log('no broadcast_id');
				incoming.respond(res, incoming.unknownResponse);

			}
			else {

				broadcast_id = broadcast_id.join('');
				broadcast_id = broadcast_id.trim();

				console.log('msg2: ', msg);

				//get remainder of msg to determine yes/no
				msg = msg.match(/[a-zA-Z]/g);
				msg = msg.join('');

				console.log('msg3: ', msg);
				console.log('broadcast_id: ', broadcast_id); 

				//TODO is this necessary?
				msg = msg.toLowerCase().trim();
				console.log('msg4: ', msg);


			    incoming.processMessage(req, res, io, phone, msg, broadcast_id);

			    //TODO tie all error messages to an error handler
			   }
			    
		});

	return router;

};


//module.exports = router;