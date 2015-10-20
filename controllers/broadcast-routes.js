var express = require('express');
var mongoose = require( 'mongoose' );
//var incoming = require('../controllers/inbound-message');
var jwt = require('jsonwebtoken');

//Set in env
if (!process.env) {

	var TWILIO_ACCOUNT_SID = 'ACb196d10158ca8e11fb1503c7c7c78f1e'; 
	var TWILIO_AUTH_TOKEN = '00c4b99ad4770a8167f79e5c4458c8f3'; 
	var TWILIO_NUMBER = '+14153001549';

}
else {

	var TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
	var TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
	var TWILIO_NUMBER = process.env.TWILIO_NUMBER;

}


var client = require('twilio')(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
var Broadcast = mongoose.model('Broadcast');
var BroadcastThread = mongoose.model('BroadcastThread');
var Response = mongoose.model('Response');
var List = mongoose.model('List');

var router =  express.Router();

// Twilio SMS webhook route
router.route('/incoming')
	
	.post(function(req, res) {

		//get phone number
		var phone = req.body.From;
	    var responseMessage;
	    console.log('response from client: ', phone);

	    //TODO make this clean!
	   	//get msg
	    var msg = req.body.Body || '';
        msg = msg.toLowerCase().trim();
        console.log('msg: ', msg);
        //get broadcast_id from msg
		broadcast_id = msg.match(/\d/g);
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


	    processMessage();

	    // Process any message the user sent to us
	    function processMessage() {

	        //NOT IN USE YET
	    	BroadcastThread.find({'phone' : phone, 'broadcast_id' : broadcast_id}, function(err, thread) {
		        // get the text message command sent by the user
		        


		        // Conditional logic to do different things based on the command from
		        // the user
		        if (msg === 'yes' || msg === 'no') {
		            // If the user has elected to subscribe for messages, flip the bit
		            // and indicate that they have done so.
		            /*
		            subscriber.subscribed = msg === 'subscribe';
		            subscriber.save(function(err) {
		                if (err)
		                    return respond('We could not subscribe you - please try '
		                        + 'again.');

		                // Otherwise, our subscription has been updated
		                var responseMessage = 'You are now subscribed for updates.';
		                if (!subscriber.subscribed)
		                    responseMessage = 'You have unsubscribed. Text "subscribe"'
		                        + ' to start receiving updates again.';
		            
		                respond(responseMessage);
		            });*/

					//find the thread Recipient is responding to
					
					

						if (err) {
							console.log('error at finding Thread ', err);
							res.status(500).send(err);
						}

						response = new Response();
						response.body = msg;

						if (msg === 'yes') {
		                	thread.status = 'Accepted';
			            }
			            if (msg === 'no') {
			                thread.status = 'Declined';
			            }


			            thread.conversation.push(response);
			            thread.save(function(err, thread) {

			            	if (err) {
			            		console.log('error at saving Thread ', err);
			            	}

			            	console.log('saved new Thread! ', thread);

			            });
					
		            
		            if (msg === 'yes') {
		                responseMessage = 'word.';
		            }
		            if (msg === 'no') {
		                responseMessage = 'whaaaat?';
		            }
		            //respond(responseMessage);
		        } else {
		            // If we don't recognize the command, text back with the list of
		            // available commands
		            responseMessage = 'Come on now homie, available commands are: yes or no';

		            
		        }
		        respond(responseMessage);
		        console.log('attempting to respond with: ', responseMessage);
				
		        // Set Content-Type response header and render XML (TwiML) response in a 
			    // Jade template - sends a text message back to user
			    function respond(message) {
			        console.log('redirecting to twiml to respond with: ', message);
			        res.type('text/xml');
			        res.render('twiml', {
			            message: message
			        });
			    }
			    
			});
	
		}
	});

router.route('/')
	
	//get all broadcasts
	.get(function(req, res) {

		//TODO get all broadcasts

	})

	//create broadcast
	.post(function(req, res) {

		//TODO save broadcast under specific user object
		//TODO compose body of message here to get broadcast_id

		var data = {};

		//create broadcast
		var broadcast = new Broadcast();

		//set broadcast properties
		broadcast.title = req.body.title;
		broadcast.body = 'There is a position open at ' + req.body.location + ', on ' + req.body.date +
		', from ' + req.body.time + '. Compensation for this job is ' + req.body.pay + '.';
		broadcast.numPositions = req.body.numPositions;
		broadcast.openPositions = req.body.numPositions;

		//associate broadcast with list if sent from Multi
		if (req.body.list_id) {
			broadcast.listID = req.body.list_id;
		}

		broadcast.save(function(err, broadcast){

			//TODO make errors user friendly

			if (err) {
				console.log('err at saving broadcast', err);
				return res.status(500).send(err);
			}

			console.log('broadcast posted', broadcast.title);
			data.title = broadcast.title;
			data.id = broadcast._id;
			return res.json(data);

		});


	});

router.route('/outgoing')

	.post(function(req, res) {

		//set response var
		var data = {};

		//create thread
		var thread = new BroadcastThread();
		if (req.query.name) {

			thread.firstName = req.query.name;

		}
		else {

			thread.firstName = 'single';

		}
		//regex clear phone number so only numbers are present
		thread.phone = req.query.phone;

		//find correct broadcast through req
		Broadcast.findById(req.query.id, function(err, broadcast) {

			if (err) {
				console.log('err at find Broadcast: ', err);
				return res.status(500).send(err);
			}
			
			thread.broadcast_id = broadcast.broadcast_id;
			console.log('thread ', thread);

			thread.save(function(err, thread) {

				if (err) {
					console.log('err at thread post', err);
					return res.status(500).send(err);
				}

				console.log('body ', broadcast.body);
				console.log('phone ', thread.phone);
				
				client.messages.create({
					to: '+'+ thread.phone,
				    from: TWILIO_NUMBER,
				    body: broadcast.body
				    //mediaUrl: "http://www.example.com/hearts.png"
				}, function(err, message) {
					if (err) {
						console.log('error at Twilio create ', err);
					}
				    console.log('message Twilio create ', message);
				    //process.stdout.write(message.sid);
				});
				
				console.log('thread posted');
				data = thread;
				return res.json(data);

			});
		
		});

			
	});

router.route('/open/all')

	.get(function(req, res) {

		//get all Broadcasts where openPositions != 0

		Broadcast.find({ openPositions: {$gt: 0} }, { body: false, __v: false }, function(err, data){

			if (err) {
				console.log('failed to get open broadcasts', err);
				return res.status(500).send(err);
			}

			console.log('retrieved open broadcasts');
			return res.json(data);

		});

	});


router.route('/threads/:id')

	.get(function(req, res) {

		//set return variable
		var data = {};

		BroadcastThread.find({broadcast_id: req.params.id}, function(err, threads) {

			if (err) {

				console.log('error at threads ', err);
				res.status(500).send(err);
			}

			console.log('got threads with id ' + req.params.id + ': ' + threads);
			return res.json(threads);

		});

	});


//!!____DEPRECATED use /threads/:id
router.route('/open/:id')

	.get(function(req, res) {

		//set return variable
		var data = {};

		//TODO get open Broadcast by ID
		Broadcast.findById(req.params.id, function(err, broadcast) {

			if (err) {
				console.log('faled to get broadcast');
				return res.status(500).send(err);
			}

			data = broadcast;

			//if Broadcast is associated with a list
			//get list and return all recipients
			/*
			if (broadcast.listID !== '') {

				List.findById(broadcast.listID, function(err, list) {

					if (err) {
						return res.status(500).send(err);
					}

					data.recipients = list.listItems;

					console.log('data ', data);
					return res.json(data);
				});

			}
			else {*/

				console.log('data ', data);
				return res.json(data);

			//}


		});

	});

module.exports = router;