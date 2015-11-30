/*

// Admin Routes

// Admin routes are used for special activities 
// such as suspending a user, deleting or editing a recipient 
// in the Master List

*/

var express = require('express');
var mongoose = require( 'mongoose' );
var async = require('async');
var _ = require('lodash');
var utils = require('./utils');
var config = require('../config/config');

var router =  express.Router();


var DefaultResponseVar = mongoose.model('DefaultResponseVar');
//TODO test isAdmin check on all admin routes in protected-routes

router.route('/')
	
	.post(function(req, res) {

		var test = req.body;
		return res.json(test);

	});

router.route('/defaultResponses/all') 

	.get(function(req, res) {

		var data = [];

		DefaultResponseVar.find(function(err, responses) {

			if (err) return res.status(500).send(err);

			if (responses.length === 0) {
				console.log('responses config: ', config.responses);

				//convert config.responses array into a readable obj for angular
				config.responses.forEach(function(responseStatus) {

					var response =  {

						'responseStatus': responseStatus,
						'body': ''

					};

					data.push(response);

				});
				console.log('config responses obj: ', data);
				return res.json(data);
			}
			else {

				async.each(config.responses, function(responseStatus) {

					var r = {};
					
					async.each(responses, function(response) {
						

						if (responseStatus === response.responseStatus) {
							r.responseStatus = response.responseStatus;
							r.body = response.body;
							r._id = response._id;
							console.log('responsStatus: ', responseStatus);

						}
					
					});

					if (_.isEmpty(r)) {
						r.responseStatus = responseStatus;
						r.body = '';
						console.log('responsStatus from empty: ', responseStatus);
					}

					data.push(r);

				});

				console.log('data: ', data);

			}
			
			console.log('default responses ', data);
			return res.json(data);

		});

	});

router.route('/defaultResponses') 

	.post(function(req, res) {

		utils.createDefaultResponseVars(req.body, res);

	});

module.exports = router;