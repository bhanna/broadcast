var express = require('express');
var mongoose = require( 'mongoose' );
var jwt = require('jsonwebtoken');
var bCrypt = require('bcrypt-nodejs');
//var User = mongoose.model('User');
//var Post = mongoose.model('Post');

var router = express.Router();

module.exports = function(){

	router.get('/success', function(req, res) {

		res.send('reached success!');

	});


	router.post('/signup', function(req, res){

		res.redirect('/auth/success');

		/*
		//TODO validate username and pass in DB
		if (!(req.body.username === 'mticciati' && req.body.password === 'thePass')) {
		    res.send(401, 'Wrong user or password');
		    return;
		}

		//TODO get profile from DB
		var profile = {
			first_name: 'Matthew',
		  	last_name: 'Ticciati',
		    id: 123
		};

		// We are sending the profile inside the token
		var token = jwt.sign(profile, session.secret, { expiresInMinutes: 60*5 });
		console.log('token', token);
		res.json({ token: token });
		*/

	});


	var isValidPassword = function(user, password){
	    return bCrypt.compareSync(password, user.password);
	};
	// Generates hash using bCrypt
	var createHash = function(password){
	    return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
	};

	return router;
};