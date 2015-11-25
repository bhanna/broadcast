/*

//This is for customized response variables from Owner
//For example, Owner can customize the text when Owner Accepts an Available Recipient

*/

var express = require('express');
var mongoose = require('mongoose');
var utils = require('./utils');


//models
var User = mongoose.model('User');
var ResponseVar = mongoose.model('ResponseVar');

var router =  express.Router();


router.route('/')
	.post(function(req, res) {



	})

	.get(function(req, res) {

		console.log('reached get responses');

		//get user_id
		var user_id = utils.convertToObj(req.user._id);


	});


module.exports = router;