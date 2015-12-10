/*

//These routes are to update and manipulate elements of a user account

*/

var express = require('express');
var mongoose = require( 'mongoose' );

var router =  express.Router();

var User = mongoose.model('User');

router.route('/update-password')
	
	.post(function(req, res) {

		var data = {};

		console.log('current password', req.body.current_password);
		console.log('new password 1', req.body.new_password);
		console.log('new password 2', req.body.new_password2);

		var current_pass = req.body.current_password;
		var new_pass = req.body.new_password;
		var new_pass2 = req.body.new_password2;
		if (current_pass !== '') {

			//TODO find current pass to see if they match

			if (new_pass !== new_pass2) {

				console.log('passwords do not match');
				data.message = 'Those new passwords don\'t match!';
				data.errors = 'match';
				res.json(data);

			}
			else {

				console.log('passwords match');
				data.message = 'Those new passwords match!';
				res.json(data);

			}
			
			//if they match check on if both new passes match
			//if yes save new pass and send success msg
			//if no send appropriate error msg
			//if current pass does not match send error msg

		}
		else {

			console.log('no current pass');
			data.message = 'You must enter your current password!';
			data.errors = 'current_pass';
			res.json(data);	

		}
		

	});

module.exports = router;