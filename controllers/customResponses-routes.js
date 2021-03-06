/*

//This is for customized response variables from Owner
//For example, Owner can customize the text when Owner Accepts an Available Recipient

*/

var express = require('express');
var mongoose = require('mongoose');
var async = require('async');
var _ = require('lodash');
var utils = require('./utils');
var config = require('../config/config');


//models
var User = mongoose.model('User');
var CustomResponseVar = mongoose.model('CustomResponseVar');
var DefaultResponseVar = mongoose.model('DefaultResponseVar');

var router =  express.Router();


router.route('/all')

	.get(function(req, res) {

		console.log('reached get responses');

		//get user_id
		//var user_id = utils.convertToObjId(req.user._id);
		var user_id = req.user.user_id;

		var data = [];

		//check for user custom variables 
		CustomResponseVar.find({ user_id : user_id }, function(err, responses){
			if (err) {
				console.log('failed to get all responses', err);
				return res.status(500).send(err);
			}

			//if no custom variables have been set
			if (_.isEmpty(responses)) {

				DefaultResponseVar.find({}, {_id: false, __v: false}, function(err, defaults) {

					if (err) return res.status(500).send(err);

					data = defaults;
					console.log('retrieved all responses from default', data);
					return res.json(data);

				});	

			}
			//if custom variables have been set
			else {

				//loop through possible responses from config
				async.each(config.responses, function(responseStatus, eachCallback) {

					console.log('reached ', responseStatus);

					async.waterfall([

							function(callback) {

								//check all custom variables against responseStatus
								async.each(responses, function(response, checkCallback) {

									//custom response exists
									if (responseStatus === response.responseStatus) {
										
										console.log('responsStatus: ', responseStatus);
										callback(null, response);
										
									}
									//custom variable does not match responseStatus
									else {
										checkCallback();
									}
															
								}, function(err) {

									//no custom variable for responseStatus 
									console.log('reached empty response callback');

									if (err) return res.status(500).send(err);
									callback(null, '');

								});

							},
							function(response, callback) {

								console.log('reached second waterfall function and have r: ', response);

								//no custom variable for responseStatus
								if (_.isEmpty(response)) {	

									//find default response variable for responseStatus
									DefaultResponseVar.findOne({responseStatus: responseStatus}, function(err, re) {
										
										var r = {};
										if (err) return res.status(500).send(err);

										r.responseStatus = re.responseStatus;
										r.body = re.body;
										console.log('responsStatus from default: ', responseStatus);
										console.log('r from default: '. r);
											
										callback(null, r);
									
									});
				
								}
								//custom variable exists for responseStatus
								else {								
									callback(null, response);
								}		

							},
							function(r, callback) {

								//add custom or default response variable to data
								data.push(r);

								console.log('reached third waterfall function and have data: ', data);

								callback(null, data);

							}

						],
						function(err, results) {

							if (err) return res.status(500).send(err);

							console.log('data: ', data);
							eachCallback();

						});
	

				}, function(err) {

					if (err) return res.status(500).send(err);
					console.log('retrieved all responses ', data);

					//sort alphabetically
					var sorted = data.sort(utils.compareResponseVars); 

					console.log('sorted data: ', sorted);
					return res.json(sorted);

				});

				
			}		

		});


	});

router.route('/')
	.post(function(req,res) {

		//get user_id
		//var user_id = utils.convertToObjId(req.user._id);
		var user_id = req.user.user_id;

		console.log(req.body);
		
		CustomResponseVar.findOne({user_id: user_id, responseStatus: req.body.responseStatus}, function(err, response) {

			if (err) return res.status(500).send(err);

			//custom variable does not exist yet
			if (!response) {

				//create custom variable
				var r = new CustomResponseVar();
				r.user_id = user_id;
				r.responseStatus = req.body.responseStatus;
				r.body = req.body.body;

				//if tied to specific broadcast
				//not in use yet
				if (req.body.broadcast_id) {
					r.broadcast_id = req.body.broadcast_id;
				}

				r.save(function(err, r) {

					if (err) return res.status(500).send(err);
					return res.json('Created!'); 

				});

			}
			//response exists
			else {

				console.log('response ', response);
				response.body = req.body.body;

				//if tied to specific broadcast
				//not in use yet
				if (req.body.broadcast_id) {
					response.broadcast_id = req.body.broadcast_id;
				}

				response.save(function(err, r) {

					if (err) return res.status(500).send(err);

					return res.status(200).send('Updated!');

				});

			}

		});
		
	});


module.exports = router;