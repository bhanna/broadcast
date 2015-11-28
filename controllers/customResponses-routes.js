/*

//This is for customized response variables from Owner
//For example, Owner can customize the text when Owner Accepts an Available Recipient

*/

var express = require('express');
var mongoose = require('mongoose');
var utils = require('./utils');


//models
var User = mongoose.model('User');
var CustomResponseVar = mongoose.model('CustomResponseVar');

var router =  express.Router();


router.route('/all')

	.get(function(req, res) {

		console.log('reached get responses');

		//get user_id
		var user_id = utils.convertToObjId(req.user._id);

		CustomResponseVar.find({ user_id : user_id }, function(err, responses){
			if (err) {
				console.log('failed to get all responses', err);
				return res.status(500).send(err);
			}

			console.log('retrieved all lists');
			return res.send(responses);

		});


	});

router.route('/:id')
	.put(function(req,res) {

		//get user_id
		var user_id = utils.convertToObjId(req.user._id);

		console.log(req.body);
		CustomResponseVar.findOne({user_id: user_id, _id: req.params.id}, function(err, response) {

			if (err) return res.status(500).send(err);

			console.log('response ', response);
			response.body = req.body.body;

			response.save(function(err, r) {

				if (err) return res.status(500).send(err);

				return res.status(200).send('Updated!');

			});
			

		});

	});


module.exports = router;