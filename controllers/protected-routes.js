var express = require('express'),
    expJwt     = require('express-jwt'),
    //jwt = require('jsonwebtoken'),
    utils = require('./utils'),
    config  = require('../config/config');
    //utils = require('./utils');


 //this route is to verify authentication

var app = module.exports = express.Router();


var jwtCheck = expJwt({
  secret: config.secret
});

app.use('/api/*', jwtCheck);

app.use('/admin/*', jwtCheck);

//app.use('/admin/*', function(req, res, next) {

//	console.log('REQ USER: ', req.user);

	//turn into object
	/*
	id = utils.convertToObj(req.user._id);
	var user_id = req.user.user_id;
	User.findById(id, function(err, user) {

		if (err) return res.status(500).send(err);
		if (user.role !== 'admin') {
			return res.redirect('/login');
		}
		next();

	});
	*/
//});