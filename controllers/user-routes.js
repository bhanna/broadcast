var express = require('express');
var mongoose = require( 'mongoose' );
var jwt = require('jsonwebtoken');
var _ = require('lodash');
var config = require('../config/config.js');
var bCrypt = require('bcrypt-nodejs');
var utils = require('./utils');
var nodemailer = require('nodemailer');
var randomstring = require("randomstring");

var User = mongoose.model('User');

var router = express.Router();


/*// XXX: This should be a database of users :).
var users = [{
  id: 1,
  email: 'meow@meow.com',
  password: '1234'
}];
*/


function createToken(user) {
  return jwt.sign(_.omit(user, 'password'), config.secret, { expiresIn: 60*5 }, { role: user.role });
}

router.route('/')
	//signup
	.post(function(req, res) {
		if (!req.body.email || !req.body.password) {
		  	return res.status(400).send('You must send the email and the password');
		}

		//role of signup
		var role;

		//admin
		if (req.body.admin_secret) {
			if (req.body.admin_secret !== config.admin_secret) {
				return res.status(400).send('Oh snap! You\'re definitely not ready to be an admin...');
			}
			else {
				role = 'admin';
			}
		}
		//beta password for users
		else if(req.body.beta_password) {
			if(req.body.beta_password !== config.beta_password) {
				return res.status(400).send('Oh snap! You must use the correct beta password');
			}
			else {
				role = 'user';
			}
		}
		//if (_.find(users, {email: req.body.email})) {
		User.find({email: req.body.email}, function(err, user) {

			if (err) return res.status(400).send(err);
			console.log('user ', user);
			if (_.find(user, {email: req.body.email})) {
				return res.status(400).send('A user with that email already exists');
			}
			
			//var profile = _.pick(req.body, 'email', 'password');
			//profile.id = _.max(users, 'id').id + 1;

			//users.push(profile);
			var newUser = new User();

            newUser.email = req.body.email;
            newUser.password = createHash(req.body.password);

            //admin or user
            newUser.role = role;

            newUser.save(function(err, user){

                if (err) {
                    console.log('save error', err);
                    return res.status(400).send('unable to save new user, ', err);
                }
                console.log('new profile ', user);

				res.status(201).send({
				    id_token: createToken(user)
				});
          
            });
				

		});
	
	});

router.route('/sessions/create')
	//login
	.post(function(req, res) {
	  	if (!req.body.email || !req.body.password) {
	    	return res.status(400).send('You must send the email and the password');
	  	}

	  	User.findOne({email: req.body.email}, function(err, user) {

	  		if (err) return res.status(400).send(err);

	  		else if (!user) {
	    		return res.status(401).send('This email does not match our records!');
	  		}
	  		else if (!isValidPassword(user, req.body.password)) {
                console.log('incorrect password');
                return res.status(401).send('This password does not match our records!');
            }
	  		//if (user.password !== req.body.password) {
	    	//	return res.status(401).send("The email or password don't match");
	  		//}	
	  		else {
	  			res.status(201).send({
	    			id_token: createToken(user),
	    			email: user.email
	  			});
	  		}
	  		


	  	});

		/*//In memory test
	  	var user = _.find(users, {email: req.body.email});
		if (!user) {
		    return res.status(401).send("The email or password don't match");
		}

		if (user.password !== req.body.password) {
		    return res.status(401).send("The email or password don't match");
		}
		
	  	res.status(201).send({
	    	id_token: createToken(user)
	  	});
	  	*/
	});

router.route('/forgot-password')
	
	.post(function(req, res) {

		/*
		console.log(req.body.email);
		var mailOptions = {
		    from: 'Broadcast <hello@broadcast.agency>', // sender address 
		    to: req.body.email, // list of receivers 
		    subject: 'Password Reset from Broadcast', // Subject line 
		    text: 'Forgot Password', // plaintext body 
		    html: '<b>Forgot password</b>' // html body 
		};
		config.transporter.sendMail(mailOptions, function(err, info) {

			if (err) return res.status(500).send(err);
			console.log('nodemailer INFO: ', info);
			res.json({'message' : 'success'});

		});
		*/
		
		
		//find user by email
		User.findOne({ email: req.body.email}, function(err, user) {
	
			if (err) return res.status(500).send(err);

			if (!user) {
	
				res.json({'message' :'Uh oh! That email did not match our records...'});

			}
			
			var new_password = randomstring.generate(12);

			user.password = createHash(new_password);

			user.save(function(err, user) {
		
				if (err) return res.status(500).send(err);

				// setup e-mail data with unicode symbols 
				var mailOptions = {
				    from: 'Broadcast <hello@broadcast.agency>', // sender address 
				    to: req.body.email, // list of receivers 
				    subject: 'Password Reset from Broadcast', // Subject line 
				    text: 'Here is your new password: ' + new_password + '.  Thank you for using Broadcast!', // plaintext body 
				    html: '<p>Hello There,</p><p>Here is your new password: ' + new_password + '</p><p>Thank you for using Broadcast!</p>' // html body 
				};

				// send mail with defined transport object 
				config.transporter.sendMail(mailOptions, function(error, info){
				    if(error) return res.status(500).send(err);

				    console.log('Message sent: ' + info.response);
					res.json({'message' : 'Your new password has been sent!'});
				    
				});

			});

		});

		
		//if no user is found return error message
		//if user is found create new password
		//send new password to user
		//createHash and save new password to the user object
		//return success message

	});


var isValidPassword = function(user, password){
    return bCrypt.compareSync(password, user.password);
};
// Generates hash using bCrypt
var createHash = function(password){
    return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
};

module.exports = router;