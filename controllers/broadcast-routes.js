var express = require('express');
var mongoose = require( 'mongoose' );
var async = require('async');
//var incoming = require('../controllers/inbound-message');
var jwt = require('jsonwebtoken');
var ObjectId = require('mongoose').Types.ObjectId; 

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

//TODOs
//Put finding different Statuses in a function
//Put parsing Statuses in a function
//Put incoming in a function
//Put outgoing in a function
//Put all functions here in Modules or Controllers!!
//Make a LOCAL module and require it
//send req and res to sendTwilio()
//clean up all errors to make user friendly
//create Owner class with respond() method
//create Recipient class with respond() method

/*//LOCAL currently returns data for testing
function sendTwilio (phone, msg, callback) {
	var data = 'sentTwilio to phone: ' + phone + ', msg: ' + msg;
	console.log('from sentTwilio: ', data);
	callback(null, data);
}*/
//LIVE
function sendTwilio(phone, msg, callback) {

	//TWILIO SEND
	client.messages.create({
		to: phone,
	    from: TWILIO_NUMBER,
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

}


//create Broadcast
function createBroadcast (broadcast_data, callback) {

	var data = {};
	console.log('broadcast_data ', broadcast_data);
	var broadcast = new Broadcast();

	//set broadcast properties
	broadcast.title = broadcast_data.title;
	broadcast.body = broadcast_data.body;
	broadcast.numPositions = broadcast_data.numPositions;
	broadcast.openPositions = broadcast_data.numPositions;

	//associate broadcast with list if sent from Multi
	if (broadcast_data.list_id) {
		broadcast.listID = broadcast_data.list_id;
		console.log('broadcast.listID at create ', broadcast.listID);
	}
	
	broadcast.save(function(err, broadcast){

		//TODO make errors user friendly

		if (err) {
			console.log('err at saving broadcast', err);
			callback('err at saving broadcast ' + err);
		}

		console.log('broadcast posted', broadcast.title);
		//data.title = broadcast.title;
		//data.id = broadcast._id;		
		data = broadcast;
		if (broadcast_data.phone) {
			data.phone = broadcast_data.phone;
		}
		console.log('data ', data);
		callback(null, data);
		//return data;

	});

}

//prepare BroadcastThread(s)
function prepareBroadcastThreads(broadcast, callback) {
	
	var recipients = [];

	console.log('broadcast.listID ', broadcast.listID);
	console.log('broadcast.broadcast_id ', broadcast.broadcast_id);

	if (broadcast.listID) {

		List.findById(broadcast.listID, function(err, list) {

			if (err) {
				console.log('err at finding list preparing threads ' + err);
				callback(err);
				//return 'err at finding list preparing threads ' + err;
			}
			else {

				console.log('list: ', list);

				async.each(list.listItems, function(val, eachCallback) {

					var recipient = {

						name: val.firstName,
						phone: val.phone

					};

					recipients.push(recipient);
					console.log('broadcast.recipients ', recipients);
					eachCallback();

				}, function(err) {

					if (err) {
						console.log('err at prepare threads create recipient array ' + err);
						//return 'err at prepare threads create recipient array ' + err;
						callback('err at prepare threads create recipient array ' + err);
					}
					else {
						broadcast.recipients = recipients;
						callback(null, broadcast);
						//return broadcast;
					}

				});

			}
		
		});

	}
	else {

		console.log('broadcast.phone ', broadcast.phone);
		//Single
		async.series([
				function(seriesCallback){

					var recipient = {

						name: 'Single',
						phone: broadcast.phone

					};
					recipients.push(recipient);
		        	//broadcast.recipients.phone = broadcast.phone;
		        	console.log('broadcast recipients ', recipients);
		        	seriesCallback();
    			},

			],

			function(err) {

				if (err) {
					callback(err);
				}

				broadcast.recipients = recipients;
				console.log('broadcast thread single: ', broadcast);
				//return broadcast;
				callback(null, broadcast);

			});	
		
	}

}

//create BroadcastThread
function createBroadcastThreads(broadcast, callback) {

	var data = {};

	console.log('broadcast.recipients from create ', broadcast.recipients);
	console.log('broadcast from create ', broadcast);
	//callback(null, 'done');
	//create a thread for each broadcast.results.recipients
	async.each(broadcast.recipients, function(recipient, eachCallback) {

		var thread = new BroadcastThread();
		console.log('broadcast_id ', broadcast.broadcast_id);
		//add '+1' to all numbers for Twilio
		thread.phone = '+1' + recipient.phone;
		thread.broadcast_id = broadcast.broadcast_id;
		thread.firstName = recipient.name;

		console.log('thread: ', thread);
		console.log('recipient ', recipient);

		async.waterfall([

			function(waterfallCallback) {
				sendTwilio(thread.phone, broadcast.body, waterfallCallback);
				console.log('sending Twilio at createBroadcastThread');
			},
			function(waterfallCallback) {
				
				thread.save(function(err, thread) {
					console.log('data from sendTwilio: ', data);
					if (err) {
						console.log('err at thread post', err);
						//return data;
						waterfallCallback(err);
						return;
					}

					console.log('body ', broadcast.body);
					console.log('phone ', thread.phone);
					

					console.log('thread posted: ', thread);
					//data = thread;
					//return data;
					waterfallCallback();

				});
			}

		],
		function(err) {


			if (err) {
				console.log('err at nested waterfall ', err);
				data.message = 'err at thread post ' + err;
				data.messageClass = 'alert-danger';
				callback(err);
				return;
			}

			eachCallback();

		});

		

	}, function (err) {

		if (err) {
			console.log('one send failed at createBroadcastThreads ', err);
			err = 'one send failed at createBroadcastThreads '+ err;
			//return 'one send failed at createBroadcastThreads ' + err;
			callback(err, data);
			return;
		}
		else {
			console.log('all sends successful at createBroadcastThreads');
			
			data.messageClass = 'alert-success';
			data.message = 'Sent!';
			//return data;
			callback(null, data);
		}

	});
	
}

//update broadcast thread
function updateBroadcastThread(req, res, thread, update) {

	console.log('update ', update);
	console.log('thread ', thread);
	
	//TODO determine update type
	//currently update only contains {status: status}

	//this needs to send back broadcast_id
	updateThreadStatus(req, res, thread, update.status);
	
}

//update thread status (also sends appropriate owner response)
function updateThreadStatus (req, res, thread, response) {
	
	BroadcastThread.findById(thread._id, function(err, thread) {

	//TODO set this message somewhere cleaner!
	console.log('status: ', response);

	async.waterfall([

			function(waterfallCallback) {

				//save the thread
				thread.status = response;
				thread.save(function(err, thread) {

					if (err) {
						console.log('err at thread save update status ', err);
						return res.status(500).send(err);
					}

					console.log('save thread update status');
					//return res.json(thread);
					waterfallCallback(null, thread);

				});

				

			},
			function(thread, waterfallCallback) {

				//parse response returns the appropriate message
				parseResponse(req, res, response, thread, waterfallCallback);

			},
			function(msg, waterfallCallback) {

				//TWILIO SEND the msg from parse response
				sendTwilio(thread.phone, msg, waterfallCallback);

			}

		],
		function(err, results) {

			if (err) return res.status(500).send(err);
			console.log('results: ', results);
			//callback();
			return res.json(thread.broadcast_id);

		});

	});
}


//parse response from Owner and return msg
function parseResponse(req, res, response, thread, callback) {

	var msg;

	//Owner Declined or Cancelled
	if (response === 'Owner Declined' || response === 'Owner Cancelled') {

		msg = 'The position is no longer available.  Thank you!';
		console.log('msg Owner Cancelled Owner Declined: ', msg);


		if (response === 'Owner Cancelled') {

			checkForNewOpenPosition(msg, thread, callback);
			console.log('reached response === Owner Cancelled');

		}
		else {
			callback(null, msg);
			return;
		}
		
	}
	else if (response === 'Accepted') {

		msg = 'You have been selected to fill the position.... To secure your spot please reply Confirm' + 
		thread.broadcast_id + ' to confirm your position.';
		
		console.log('msg Accept: ', msg);
		callback(null, msg);
		return;

	}
	else if (response === 'Reopened') {
		msg = 'This position has been reopened.... To secure your spot please reply Confirm' + 
		thread.broadcast_id + ' to confirm your position.';
		
		console.log('msg Reopen: ', msg);
		callback(null, msg);
		return;
	}

	//return msg;
	

}


function checkForNewOpenPosition (msg, thread, callback) {

	console.log('checking for new open positions...');

	//update openPositions with a +1
	Broadcast.findOne({'broadcast_id': thread.broadcast_id}, 
		function(err, broadcast) {

    		if (err) {
    			console.log('err at updating openPositions ', err);
    		}

    		var wasFull;
    		//check if openPositions was zero, set marker
    		if (broadcast.openPositions === 0) {
    			wasFull = true;
    		}

    		//make sure openPositions does not exceed numPositions
    		if (broadcast.numPositions > broadcast.openPositions) {
    			broadcast.openPositions = broadcast.openPositions + 1;
    			console.log('new openPositions ', broadcast.openPositions);

    			//if openPostions used to === 0 send message that there is new opening
    			//to all Available and Accepted
    			if (typeof wasFull !== 'undefined') {

    				var available = [];
    				var openMsg = 'A position has opened up for ' + broadcast.broadcast_id + 
    				'! Yes' + broadcast.broadcast_id + ' or No' + broadcast.broadcast_id + '?';
    				//TODO clean this up
    				//get Available and Accepted and store in obj array
    				async.waterfall([
    					function(waterfallCallback) {
    						BroadcastThread.find({
	            					'broadcast_id': broadcast.broadcast_id, 
						            'status': {$in: ['Available', 'Accepted']},
					        	},
					            function(err, allAvailable) {

					            	if (err) {
					            		console.log('error at find allAvailable ', err);
					            	}
					            	else {
					            		available = allAvailable;
					            		console.log('set available: ', available);
					            		waterfallCallback(null, available);							
					            	}
					            	
					            
					        });
    					},
    					//need function to set all available to Pending
    					function(available, waterfallCallback) {

    						async.each(available, function(a, eachCallback) {

    							BroadcastThread.findById(a._id, function(err, a) {

    								if (err) {
    									console.log('could not find available by ID to set to Pending ', err);
    									callback(err);
    									return;
    								}
    								a.status = 'Pending';
    								a.save(function(err, a) {

    									if (err) {
	    									console.log('could not save available status to Pending ', err);
	    									callback(err);
	    									return;
	    								}
	    								//eachCallback();
	    								//sendTwilio that there is an open position
	    								sendTwilio(a.phone, openMsg, eachCallback);

    								});

    							});

    						}, function(err) {

    							if (err) {
									console.log('failed at async.each available set status to Pending ', err);
									callback(err);
									return;
								}
								else {
									console.log('success at async.each available set status to Pending');
									waterfallCallback(null, available);
								}

    						});

    					},
  
    				]);
    				           				
    			}

    			broadcast.save(function(err, broadcast) {

    				if (err) {
    					console.log('err ', err);
    					return res.status(500).send(err);
    				}
    				console.log('updated openPositions ', broadcast);
    				//return msg;
    				callback(null, msg);

    			});
    		} 
    		else {

    			//all positions are still open
    			console.log('did not update openPositions: numPositions: ' + broadcast.numPositions + ', openPositions: ' + broadcast.openPositions);
    			//return msg;
    			callback(null, msg);
    		}

	});

}


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

	    //TODO tie all error messages to an error handler

	    // Process any message the user sent to us
	    function processMessage() {

	    	//check open positions in Broadcast
	    	Broadcast.findOne({'broadcast_id': broadcast_id}, function(err, broadcast) {

	    		if (err) {
	    			console.log('error at find Broadcast to verify openPositions ', err);
	    			return respond('Something went wrong - perhaps you entered the wrong offer ID?  Please check your response and try again.');
	    		}
	    		if (!broadcast) {
	    			console.log('could not find broadcast ');
	    			return respond('Something went wrong - perhaps you entered the wrong offer ID?  Please check your response and try again.');
	    		}
	    		else {
	    			
    				//find the thread Recipient is responding to and update
			    	BroadcastThread.findOne({
			    			'phone': phone, 
			    			'broadcast_id': broadcast_id
			    		}, function(err, thread) {
				        // get the text message command sent by the user

				        if (err) {
							console.log('error at finding Thread ', err);
							return respond('Something went wrong - perhaps you responded to the wrong offer?  Please check your response and try again.');
						}
				        if (!thread) {
				        	console.log('could not find thread ');
    						return respond('Something went wrong - perhaps you responded to the wrong offer?  Please check your response and try again.');
				        }
				        console.log('Thread found: ', thread);

				        //positions available
    					if (broadcast.openPositions !== 0) {

    						 // Handle yes no or confirm
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
										if (thread.status === 'Owner Cancelled' || thread.status === 'Owner Declined') {

						            		response.body = 'attempted Yes when Owner Cancelled or Owner Declined';
						            		responseMessage = 'We\'re sorry, but this position has been cancelled.';
						            		console.log('responseMessage Owner Cancelled or Owner Declined ', responseMessage);

						            	}
						            	else {

						            		thread.status = 'Available';
					                		responseMessage = 'Great.  We will contact you shortly to confirm the position.';
					                		console.log('responseMessage Yes ', responseMessage);

						            	}
					                	
						            }
						            else if (msg === 'no') {

						            	if (thread.status === 'Owner Cancelled' || thread.status === 'Owner Declined') {

						            		response.body = 'attempted Yes when Owner Cancelled or Owner Declined';
						            		responseMessage = 'We\'re sorry, but this position has been cancelled.';
						            		console.log('responseMessage Owner Cancelled or Owner Declined ', responseMessage);

						            	}
						            	else {

						            		thread.status = 'Recipient Declined';
						                	responseMessage = 'You have been unsubscribed from this position.  If you change your mind, please text Yes'+broadcast_id;
						                	console.log('responseMessage No ', responseMessage);

						            	}
						                
						            }
						            else if (msg === 'confirm') {
						            	//check if Owner Cancelled
						            	if (thread.status === 'Owner Cancelled' || thread.status === 'Owner Declined') {

						            		response.body = 'attempted to confirm when Owner Cancelled or Owner Declined';
						            		responseMessage = 'We\'re sorry, but this position has been cancelled.';
						            		console.log('responseMessage Owner Cancelled or Owner Declined ', responseMessage);

						            	}
						            	else if (thread.status === 'Recipient Cancelled') {

						            		response.body = 'attempted to confirm when Recipient Cancelled';
						            		responseMessage = 'To re-apply please text Yes' + broadcast_id;
						            		console.log('responseMessage Owner Cancelled Confirm ', responseMessage);

						            	}
						            	else {

						            		thread.status = 'Confirmed';
							            	responseMessage = 'Thank you for confirming.  To cancel at any time please text Cancel' + broadcast_id;
							            	console.log('responseMessage Confirm ', responseMessage);
							            	//update broadcast openPositions at Confirm
							            	Broadcast.findOneAndUpdate(
							            		{'broadcast_id': thread.broadcast_id}, 
							            		{ $inc: { openPositions: -1 }}, 
							            		{ new: true }, 
							            		function(err, broadcast) {

								            		if (err) {
								            			console.log('err at updating openPositions ', err);
								            		}
								            		else {
								            			console.log('broadcast updated: ', broadcast);
								            			//If openPositions === 0
								            			//message all Available Recipients that the position has been reopened
								            			if (broadcast.openPositions === 0) {

								            				//TODO make a send function and call it...
								            				//find Available Recipients
								            				BroadcastThread.find({
								            						'broadcast_id': broadcast.broadcast_id, 
								            						'status': {$in: ['Available', 'Accepted']}
								            					}, 
								            					function(err, availableThreads) {

								            						console.log('availableThreads ', availableThreads);
								            						responseMessage = 'All positions have been filled.  Thank you!';

								            						//send to each availableThread
								            						async.each(availableThreads, function(available, callback) {

								            								console.log('available phone: ', available.phone);
								            								if (!available.phone) {
								            									console.log('could not find available phone');
								            								}
								            								else {
								            									console.log('reached send, available phone ' + available.phone + ' and msg: ' + responseMessage);
								            									sendTwilio(available.phone, responseMessage, callback);
								            									//console.log('sendtwilio tried with '+ available.phone + ' and msg ' + responseMessage);
								            									//callback();
								            								}
								            								

								            							}, function (err) {

								            								if (err) {
								            									console.log('one send failed at available');
								            								}
								            								else {
								            									console.log('all sends successful at available');
								            								}
								            						});
								            						

								            				});


								            			}
								            			console.log('updated openPositions ', broadcast.openPositions);
								            		}

							            	});

						            	}
						            	

						            }
						            else {

						            	if (thread.status === 'Accepted') {
						            		responseMessage = 'Please respond "Confirm' +broadcast_id+'"';
						            	}
						            	else if (thread.status === 'Pending') {
						            		responseMessage = 'Please respond "Yes' +broadcast_id+'" or No'+broadcast_id+'"';
						            	}
						            	
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

				        }
		    			//all positions filled
		    			else {

		    				if (msg === 'cancel') {

		    					//Recipient is Cancelling

		    					//set response message
		    					responseMessage = 'Cancellation successful. If you change your mind please text Yes' + broadcast_id;
		    					console.log('cancel message ', responseMessage);

		    					thread.status = 'Recipient Cancelled';

		    					Broadcast.findOneAndUpdate({'broadcast_id': thread.broadcast_id}, { $inc: { openPositions: 1 }}, 
				            		function(err) {

					            		if (err) {
					            			console.log('err at updating openPositions cancel ', err);
					            		}
					            		else {
					            			console.log('updated openPositions cancel ', broadcast.openPositions);
					            		}

				            	});

				            	thread.conversation.push(response);
					            var subdocCancel = thread.conversation[0];
					            console.log('conversation: ', subdocCancel);
					            console.log('thread: ', thread);

					            thread.save(function(err, thread) {

					            	if (err) {
					            		console.log('error at saving Thread ', err);
					            	}

					            	console.log('saved new Thread! ', thread);

					            });

		    					//TODO message Owner about cancellation



		    					respond(responseMessage);
			        			console.log('attempting to respond with: ', responseMessage);

		    				}
		    				else {

		    					responseMessage = 'All positions have been filled';
			    				respond(responseMessage);
					        	console.log('attempting to respond with: ', responseMessage);

		    				}	

		    			}
				       
					    
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

	//create broadcast and broadcastThreads
	.post(function(req, res) {

		//TODO save broadcast under specific user object

		
		async.waterfall([
				
				//create Broadcast
				function(callback) {
					console.log('req.body ', req.body);
					//returns saved broadcast
					createBroadcast(req.body, callback);
					//console.log('data: ', data);
					//callback(null, data);
				},				
				//prepare BroadcastThreads by getting List or sending Single
				function(data, callback) {
					console.log('created broadcast: ', data);
					//returns broadcast and recipients
					prepareBroadcastThreads(data, callback);
				},
				//create BroadcastThreads
				function(data, callback) {
					console.log('prepared threads(s): ', data);
					//returns message and messageClass
					createBroadcastThreads(data, callback);
				},
				
			], function(err, results) {
					console.log('success message: ', results);
					return res.json(results);
				});


	});

router.route('/outgoing')

	.post(function(req, res) {

		console.log('req.query, ', req.query);
		updateBroadcastThread(req, res, req.body, req.query);
			
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
//TODO make this more flexible using req.query for db queries
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
		
			console.log('broadcast from open/id data ', data);
			return res.json(data);

		});

	});

router.route('/filled/all')

	.get(function(req, res) {

		//get all Broadcasts where openPositions != 0

		Broadcast.find({ openPositions: 0}, { body: false, __v: false }, function(err, data){

			if (err) {
				console.log('failed to get filled broadcasts', err);
				return res.status(500).send(err);
			}

			console.log('retrieved filled broadcasts');
			return res.json(data);

		});

	});

module.exports = router;