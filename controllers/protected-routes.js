var express = require('express'),
    expJwt     = require('express-jwt'),
    //jwt = require('jsonwebtoken'),
    config  = require('../config/config');
    //utils = require('./utils');


 //this route is to verify authentication

var app = module.exports = express.Router();


var jwtCheck = expJwt({
  secret: config.secret
});

app.use('/api/*', jwtCheck);
