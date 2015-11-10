var express = require('express'),
    expJwt     = require('express-jwt'),
    //jwt = require('jsonwebtoken'),
    config  = require('../config/config');


 //this route is to verify authentication

var app = module.exports = express.Router();


var jwtCheck = expJwt({
  secret: config.secret
});

//app.use(expJwt({ secret: config.secret, requestProperty: 'payload' }));



app.use('/api/*', jwtCheck);
/*
app.use(function (req, res, next) {
	console.log('user: ', req.user);
	next();
  
  users.get(req.token.user_id, function (err, user) {
    if (err) return next(err);
    req.user = user;
    consol.log('req.user ', req.user);
    next();
  });

});*/