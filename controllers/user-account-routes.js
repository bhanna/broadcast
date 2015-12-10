/*

//These routes are to update and manipulate elements of a user account

*/

var express = require('express');
var mongoose = require( 'mongoose' );

var router =  express.Router();

var User = mongoose.model('User');

router.route('/update-password')
	
	.post(function(req, res) {



	});

module.exports = router;