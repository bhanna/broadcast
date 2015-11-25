/*

// Admin Routes

// Admin routes are used for special activities 
// such as suspending a user, deleting or editing a recipient 
// in the Master List

*/

var express = require('express');
var mongoose = require( 'mongoose' );
var utils = require('./utils');

var router =  express.Router();

//TODO add utils.isAdmin() check on all admin routes

router.route('/')
	
	.post(function(req, res) {

		var test = req.body;
		return res.json(test);

	});

module.exports = router;