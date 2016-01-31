/*

//These routes are to update and manipulate elements of a user account

*/

var express = require('express');
var mongoose = require( 'mongoose' );
var utils = require('./utils');

var router =  express.Router();

var User = mongoose.model('User');

router.route('/update-password')
	
	.post(function(req, res) {

		var data = {};

		var current_pass = req.body.current_password;
		var new_pass = req.body.new_password;
		var new_pass2 = req.body.new_password2;
		if (current_pass !== '') {

			User.findById(req.user_id, function(err, user) {

				if (err) return res.status(500).send(err);

				//password is incorrect
				else if (!utils.isValidPassword(user, current_pass)) {
	            
	                console.log('Incorect current password');
					data.message = 'Incorect current password';
					data.errors = 'current_pass';
					return res.json(data);
	            
	            }

	            //new passwords don't match
				else if (new_pass !== new_pass2) {

					console.log('passwords do not match');
					data.message = 'Those new passwords don\'t match!';
					data.errors = 'match';
					res.json(data);

				}

				//all's well
				else {

					console.log('passwords match');
					user.password = utils.createHash(new_pass);
					user.save(function(err, user) {

						if (err) return res.status(500).send(err);
						
						data.message = 'Password updated!';
						res.json(data);

					});
					
				}
					

			});

			
		}
		//current_pass is empty
		else {

			console.log('no current pass');
			data.message = 'You must enter your current password!';
			data.errors = 'current_pass';
			res.json(data);	

		}
		

	});

module.exports = router;