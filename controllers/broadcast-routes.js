var express = require('express');
var mongoose = require( 'mongoose' );
var async = require('async');
var jwt = require('jsonwebtoken');
var utils = require('./utils');
var config = require('../config/config');



var Broadcast = mongoose.model('Broadcast');
var BroadcastThread = mongoose.model('BroadcastThread');
var Response = mongoose.model('Response');
var List = mongoose.model('List');
var Recipient = mongoose.model('Recipient');

var router =  express.Router();

//TODOs
//Put finding different Statuses in a function
//Put parsing Statuses in a function
//Put incoming in a function
//Put outgoing in a function
//Put all functions here in Modules or Controllers!!
//send req and res to utils.sendTwilio()?
//clean up all errors to make user friendly
//create Owner class with respond() method
//create Recipient class with respond() method


//create Broadcast
function createBroadcast (broadcast_data, user_id, callback) {

	console.log('USERID ', user_id);

	var data = {};
	console.log('broadcast_data ', broadcast_data);
	var broadcast = new Broadcast();

	//set broadcast 
	broadcast.user_ids = [user_id];
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

		Recipient.find({list_ids: broadcast.listID, user_ids: broadcast.user_ids[0]}, function(err, recipients) {	

			if (err) {
				console.log('err at finding recipients preparing threads ' + err);
				callback(err);
				//return 'err at finding list preparing threads ' + err;
			}
			else {

				console.log('recipients: ', recipients);

				broadcast.recipients = recipients;
				callback(null, broadcast);
			
			}
		
		});

	}
	else {

		console.log('broadcast.phone ', broadcast.phone);
		//Single
		async.series([
				function(seriesCallback){

					var recipient = {

						firstName: 'Single',
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
		thread.firstName = recipient.firstName;

		console.log('thread: ', thread);
		console.log('recipient ', recipient);

		async.waterfall([

			function(waterfallCallback) {
				utils.sendTwilio(thread.phone, broadcast.body, waterfallCallback);
				console.log('sending Twilio at createBroadcastThread');
			},
			function(waterfallCallback) {
				
				thread.save(function(err, thread) {
					//console.log('data from utils.sendTwilio: ', data);
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

	//TODO if response === Reopen or Accept and openPositions === 0 
	//return 'No more open positions'
	//TODO TEST
	//this needs to send back broadcast_id
	Broadcast.findOne({broadcast_id: thread.broadcast_id, user_ids: req.user._id}, function(err, broadcast) {

		if (err) return res.status(500).send(err);

		if (broadcast.openPositions === 0 && (update.status === 'Reopened' || update.status === 'Accepted')) {

			var data = {};
			data.message = 'Sorry! This position cannot be ' + update.status.toLowerCase() + ' because there are no more positions available';
			data.broadcast_id = broadcast.broadcast_id;
			return res.json(data);

		}
		else {

			//this needs to send back broadcast_id
			updateThreadStatus(req, res, thread, update.status);

		}

	});

	
}

//update thread status (also sends appropriate owner response)
function updateThreadStatus (req, res, thread, response) {
	
	BroadcastThread.findById(thread._id, function(err, thread) {

	//TODO update status thread after sendTwilio
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
				parseOwnerResponse(req, res, response, thread, waterfallCallback);

			},
			function(msg, waterfallCallback) {

				//TWILIO SEND the msg from parse response
				utils.sendTwilio(thread.phone, msg, waterfallCallback);

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
function parseOwnerResponse(req, res, response, thread, callback) {

	var msg;

	//Owner Declined or Cancelled
	if (response === 'Owner Declined') {

		msg = 'The position is no longer available.  Thank you!';
		console.log('msg Owner Cancelled Owner Declined: ', msg);
		callback(null, msg);
		return;
	}

	else if (response === 'Owner Cancelled') {

		msg = 'Oh no, the creator of this job has cancelled it.  We\'re sorry for any inconvenience.';
		checkForNewOpenPosition(msg, thread, callback);
		console.log('reached response === Owner Cancelled');

		
	}
	else if (response === 'Accepted') {

		msg = 'You have been selected to fill the position. To secure your spot, please reply Confirm' + 
		thread.broadcast_id + ' to confirm your position.';

		//TODO check if there are openPositions

		console.log('msg Accept: ', msg);
		callback(null, msg);
		return;

	}
	else if (response === 'Reopened') {
		msg = 'This position has been reopened. To secure your spot please reply Confirm' + 
		thread.broadcast_id + ' to confirm your position.';
		
		//TODO check if there are openPositions

		console.log('msg Reopen: ', msg);
		callback(null, msg);
		return;
	}
	

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
	    								//utils.sendTwilio that there is an open position
	    								utils.sendTwilio(a.phone, openMsg, eachCallback);

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



router.route('/')
	
	//get all broadcasts
	.get(function(req, res) {

		//TODO get all broadcasts

	})

	//create broadcast and broadcastThreads
	.post(function(req, res) {

		//TODO save broadcast under specific user object

		//get user_id
		var user_id = utils.convertToObj(req.user._id);
		console.log('USERID from pre waterfall ', user_id);

		async.waterfall([
				
				//create Broadcast
				function(callback) {
					console.log('req.body ', req.body);
					console.log('req.user ', req.user);
					//returns saved broadcast
					//TODO add add user_id field 
					createBroadcast(req.body, user_id, callback);
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
					if (err) {
						console.log('create broadcast and broadcast threads err: ', err);
						return res.status(500).send(err);
					}
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

		//get user_id
		var user_id = utils.convertToObj(req.user._id);

		//get all Broadcasts where openPositions != 0
		//TODO add add user_id field to show only User's Broadcasts
		Broadcast.find({ openPositions: {$gt: 0}, user_ids: user_id }, { body: false, __v: false }, function(err, data){

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

		//get user_id
		var user_id = utils.convertToObj(req.user._id);

		//get all Broadcasts where openPositions != 0
		//TODO add add user_id field to show only User's Broadcasts
		Broadcast.find({ openPositions: 0, user_ids: user_id}, { body: false, __v: false }, function(err, data){

			if (err) {
				console.log('failed to get filled broadcasts', err);
				return res.status(500).send(err);
			}

			console.log('retrieved filled broadcasts');
			return res.json(data);

		});

	});

module.exports = router;