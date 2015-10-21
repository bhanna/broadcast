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

		response = new Response();
		response.body = msg;

		// Set Content-Type response header and render XML (TwiML) response in a 
	    // Jade template - sends a text message back to user
	    function respond(message) {
	        console.log('redirecting to twiml to respond with: ', message);
	        res.type('text/xml');
	        res.render('twiml', {
	            message: message
	        });
	    }

	    processMessage();

	    // Process any message the user sent to us
	    function processMessage() {

	    	//check open positions in Broadcast
	    	Broadcast.findOne({'broadcast_id': broadcast_id}, function(err, broadcast) {

	    		if (err) {

	    			console.log('error at find Broadcast to verify openPositions ', err);
	    			return respond('Something went wrong - please check your response and try again.');
	    		}
	    		if (!broadcast) {
	    			console.log('could not find broadcast ');
	    			return respond('Something went wrong - please check your response and try again.');
	    		}
	    		else {
	    			//positions available
	    			if (broadcast.openPositions !== 0) {

	    				//find the thread Recipient is responding to and update
				    	BroadcastThread.findOne({
				    			'phone': phone, 
				    			'broadcast_id': broadcast_id
				    		}, function(err, thread) {
					        // get the text message command sent by the user

					        if (err) {
								console.log('error at finding Thread ', err);
								return respond('Something went wrong - please check your response and try again.');
							}
					        if (!thread) {
					        	console.log('could not find thread ');
	    						return respond('Something went wrong - please check your response and try again.');
					        }
					        console.log('Thread found: ', thread);

					        // Conditional logic to do different things based on the command from
					        // the user
					        if (msg === 'yes' || msg === 'no' || msg === 'confirm') {
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


									if (msg === 'yes') {
					                	thread.status = 'Available';
					                	responseMessage = 'Great.  We will contact you shortly to confirm the position.';
					                	console.log('responseMessage Yes ', responseMessage);
						            }
						            else if (msg === 'no') {
						                thread.status = 'Declined';
						                responseMessage = 'You have been unsubscribed from this position.';
						                console.log('responseMessage No ', responseMessage);
						            }
						            else if (msg === 'confirm') {
						            	thread.status = 'Confirmed';
						            	responseMessage = 'Thank you for confirming';
						            	console.log('responseMessage Confirm ', responseMessage);
						            	//update broadcast openPositions at Confirm
						            	Broadcast.findOneAndUpdate({'broadcast_id': thread.broadcast_id}, { $inc: { openPositions: -1 }}, 
						            		function(err) {

							            		if (err) {
							            			console.log('err at updating openPositions ', err);
							            		}
							            		else {
							            			console.log('updated openPositions ', broadcast.openPositions);
							            		}

						            	});

						            }
						            else {
						            	responseMessage = 'Please respond "Yes' +broadcast_id+'" or No'+broadcast_id+'"';
						            }


						            thread.conversation.push(response);
						            var subdoc = thread.conversation[0];
						            console.log('conversation: ', subdoc);
						            console.log('thread: ', thread);

						            thread.save(function(err, thread) {

						            	if (err) {
						            		console.log('error at saving Thread ', err);
						            	}

						            	console.log('saved new Thread! ', thread);

						            });
						            respond(responseMessage);
			        				console.log('attempting to respond with: ', responseMessage);

					        } 
						    
						});

	    			}
	    			//all positions filled
	    			else {

	    				responseMessage = 'All positions have been filled';
	    				respond(responseMessage);
			        	console.log('attempting to respond with: ', responseMessage);

	    			}

	    			
					

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

		//TODO clean this up for fucks sake!

		if (!req.query.status) {

			//new thread is needed
			//create thread
			var thread = new BroadcastThread();
			if (req.query.name) {

				thread.firstName = req.query.name;

			}
			else {

				thread.firstName = 'single';

			}
			//regex clear phone number so only numbers are present
			//TODO This sould be in Model somehow
			//add '+1' to all numbers for Twilio
			thread.phone = '+1' + req.query.phone;

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
					
					//TWILIO SEND
					client.messages.create({
						to: thread.phone,
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

		}
		else {

			//TODO clean this up
			//currently for update status
			//these need to be centralized, perhaps in Models..
			console.log('body: ',req.body);
			var status = req.query.status;
			console.log('query status: ', req.query.status);

			BroadcastThread.findById(req.body._id, function(err, thread) {

				//TODO set this message somewhere cleaner!
				var msg; 

				console.log('status: ', status);

				if (status === 'Declined') {

					msg = 'The position is no longer available.  Thank you!';
					console.log('msg Decline: ', msg);

					//update openPositions
					//update for Accepted will happen when a Recipient Confirms in /incoming
					Broadcast.findOne({'broadcast_id': thread.broadcast_id}, 
						function(err, broadcast) {

		            		if (err) {
		            			console.log('err at updating openPositions ', err);
		            		}
		            		//make sure openPositions does not exceed numPositions
		            		if (broadcast.numPositions > broadcast.openPositions) {
		            			broadcast.openPositions = broadcast.openPositions + 1;
		            			console.log('new openPositions ', broadcast.openPositions);

		            			broadcast.save(function(err, broadcast) {

		            				if (err) {
		            					console.log('err ', err);
		            					return res.status(500).send(err);
		            				}
		            				console.log('updated openPositions ', broadcast);

		            			});
		            		} 
		            		else {

		            			//all positions are still open
		            			console.log('did not update openPositions: numPositions: ' + broadcast.numPositions + ', openPositions: ' + broadcast.openPositions);
		            		}
		        
	            	});
				}
				else if (status === 'Accepted') {

					msg = 'You have been selected to fill the position.... To secure your spot please reply Confirm' + 
					thread.broadcast_id + ' to confirm your position.';
					
					console.log('msg Accept: ', msg);

				}
				

				if (err) {
					console.log('err at find thread update status ', err);
					return res.status(500).send(err);
				}

				thread.status = status;
				thread.save(function(err, thread) {

					if (err) {
						console.log('err at thread save update status ', err);
						return res.status(500).send(err);
					}

					//TWILIO SEND
					client.messages.create({
						to: thread.phone,
					    from: TWILIO_NUMBER,
					    body: msg
					    //mediaUrl: "http://www.example.com/hearts.png"
					}, function(err, message) {
						if (err) {
							console.log('error at Twilio update decline/accept ', err);
						}
					    console.log('message Twilio update decline/accept ', message);
					    //process.stdout.write(message.sid);
					});
					

					console.log('save thread update status');
					return res.json(thread);

				});

			});

		}

		

			
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
				return res.status(500).send(err);
			}

			console.log('got threads with id ' + req.params.id + ': ' + threads);
			return res.json(threads);

		});

	});

//currently used for refreshPositions...
router.route('/open/:id')

	.get(function(req, res) {

		//set return variable
		var data = {};

		var query;

		if (req.query.openPositions) {
			query = 'openPositions';
		}

		//TODO get open Broadcast by ID
		//TODO make this a flexible query according to req.query values
		Broadcast.findById(req.params.id, function(err, broadcast) {

			if (err) {
				console.log('faled to get broadcast');
				return res.status(500).send(err);
			}

			if (query == 'openPositions') {
				data = broadcast.openPositions;
			}
			else {
				data = broadcast;
			}
			

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