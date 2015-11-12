var express = require('express');
var mongoose = require( 'mongoose' );
var async = require('async');
var config = require('../config/config');
var utils = require('./utils');


var Broadcast = mongoose.model('Broadcast');
var BroadcastThread = mongoose.model('BroadcastThread');
var Response = mongoose.model('Response');
var List = mongoose.model('List');
var Recipient = mongoose.model('Recipient');


var router =  express.Router();

// Set Content-Type response header and render XML (TwiML) response in a 
// Jade template - sends a text message back to user


// Twilio SMS webhook route
router.route('/')
	
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
        //TODO make cleaner parse so that there isn't a chance of joining an actual broadcast id
        //maybe find "yes#" or "no#" and then match \d 
		broadcast_id = msg.match(/\d/g);

		console.log('BROADCAST ID ', broadcast_id);

		//no numbers
		if (!broadcast_id) {

			console.log('no broadcast_id');
			respond('Whoops - that is not a response I recognize. Perhaps you entered the wrong offer ID? Please check your response and try again.');

		}

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


	    processMessage();

	    //TODO tie all error messages to an error handler

	    // Process any message the user sent to us
	    function processMessage() {

	    	//check open positions in Broadcast
	    	Broadcast.findOne({'broadcast_id': broadcast_id}, function(err, broadcast) {

	    		if (err) {
	    			console.log('error at find Broadcast to verify openPositions ', err);
	    			return respond('Whoops - that is not a response I recognize. Perhaps you entered the wrong offer ID? Please check your response and try again.');
	    		}
	    		if (!broadcast) {
	    			console.log('could not find broadcast ');
	    			return respond('Whoops - that is not a response I recognize. Perhaps you entered the wrong offer ID? Please check your response and try again.');
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
							return respond('Whoops - that is not a response I recognize. Perhaps you entered the wrong offer ID? Please check your response and try again.');
						}
				        if (!thread) {
				        	console.log('could not find thread ');
    						return respond('Whoops - that is not a response I recognize. Perhaps you entered the wrong offer ID? Please check your response and try again.');
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
					                		responseMessage = 'Great, we will let you know if you have been selected to fill this position.';
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
						                	responseMessage = 'Thanks for the update. We will let you know if future opportunities come up. If you change your mind, please text Yes'+broadcast_id;
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
						            		console.log('responseMessage Recipient Cancelled Confirm ', responseMessage);

						            	}
						            	else if (thread.status === 'Pending') {

						            		response.body = 'attempted to confirm when Pending';
						            		responseMessage = 'Please text Yes' + broadcast_id + ' to tell us you are available.';
						            		console.log('responseMessage Pending Confirm ', responseMessage);

						            	}
						            	else {

						            		thread.status = 'Confirmed';
							            	responseMessage = 'Thank you for confirming. We will be in touch with the details. If at any time you need to cancel, please let us know by texting Cancel' + broadcast_id;
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
								            									utils.sendTwilio(available.phone, responseMessage, callback);
								            									//console.log('utils.sendTwilio tried with '+ available.phone + ' and msg ' + responseMessage);
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
					        else {

				            	if (thread.status === 'Accepted') {			            		
				            		responseMessage = 'Please respond "Confirm' +broadcast_id+'"';
				            		console.log('reached unknown response at Accepted.  msg ', responseMessage);
				            		respond(responseMessage);
				            	}
				            	else if (thread.status === 'Pending') {
				            		responseMessage = 'Please respond "Yes' +broadcast_id+'" or No'+broadcast_id+'"';
				            		console.log('reached unknown response at Pending.  msg ', responseMessage);
				            		respond(responseMessage);
				            	}
				            	
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

		    					Broadcast.findOneAndUpdate(
		    						{'broadcast_id': thread.broadcast_id}, 
		    						{ $inc: { openPositions: 1 }},
		    						{ new: true }, 
				            		function(err, broadcast) {

					            		if (err) {
					            			console.log('err at updating openPositions cancel ', err);
					            		}
					            		else {
					            			BroadcastThread.find({
			            						'broadcast_id': broadcast.broadcast_id, 
			            						'status': {$in: ['Available', 'Accepted']}
			            					}, 
			            					function(err, availableThreads) {
						            			console.log('updated openPositions cancel ', broadcast.openPositions);
						            			console.log('availableThreads ', availableThreads);
			            						responseMessage = 'A position has opened for ' + broadcast.broadcast_id + '! Still available? Yes' + broadcast.broadcast_id + ' of No' + broadcast.broadcast_id + '?';

			            						//send to each availableThread
			            						async.each(availableThreads, function(available, callback) {

			            								console.log('available phone: ', available.phone);
			            								if (!available.phone) {
			            									console.log('could not find available phone');
			            								}
			            								else {
			            									console.log('reached send, available phone ' + available.phone + ' and msg: ' + responseMessage);
			            									utils.sendTwilio(available.phone, responseMessage, callback);
			            									//console.log('utils.sendTwilio tried with '+ available.phone + ' and msg ' + responseMessage);
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
		function respond(message) {
		    console.log('redirecting to twiml to respond with: ', message);
		    res.type('text/xml');
		    res.render('twiml', {
		        message: message
		    });
		}
	});

module.exports = router;