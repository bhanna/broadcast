var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
//var passport = require('passport');
//var expressJwt = require('express-jwt');
var jwt = require('jsonwebtoken');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

//var server = require('./bin/www');

//initialze models
require('./models');


/**
 * Socket IO
 */
var socket_io = require('socket.io');
//var io = require('socket.io').listen(server);
//var io = require('./sockets/base').listen(server);

//var inc = require('./controllers/incoming');




//var index = require('./routes/index');
//var auth = require('./auth');
//var recipients = require('./routes/recipient-routes');
//var broadcasts = require('./routes/broadcast-routes');
//var lists = require('./routes/list-routes');
//var api = require('./routes/api');
//var authenticate = require('./routes/authenticate')(passport);

//connect to mongoDB
if (!process.env.MONGOLAB_URI) {

  mongoose.connect('mongodb://localhost/broadcastLocal');
  console.log('Local DB');

}
else {

  mongoose.connect(process.env.MONGOLAB_URI);
}


var app = express();

var io = socket_io();

app.io = io;


io.on('connection', function(socket) {

  console.log('SOCKET FROM APPJS');

});


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
//app.use('/api', expressJwt({secret: 'secret meowfriend'}));
/*//TODO figure session out
app.use(session({

  secret: process.env.SESSION_SECRET || 'secret cat',
  saveUninitialized: false,
  resave: true

}));
*/
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
//app.use(passport.initialize());
//app.use(passport.session());

//app.use(require('./controllers'));

app.use('/incoming', require('./controllers/incoming')(io));
app.use(require('./controllers/protected-routes'));
app.use('/users', require('./controllers/user-routes'));
app.use('/admin', require('./controllers/admin-routes'));
app.use('/api/protected/lists', require('./controllers/list-routes'));
app.use('/api/protected/recipients', require('./controllers/recipient-routes'));
app.use('/api/protected/broadcasts', require('./controllers/broadcast-routes')(io));
app.use('/api/protected/user-accounts', require('./controllers/user-account-routes'));
app.use('/api/protected/customResponses', require('./controllers/customResponses-routes'));


// Mount middleware to notify Twilio of errors
//app.use(twilioNotifications.notifyOnError);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// Initialize Passport
//var initPassport = require('./passport-init');
//initPassport(passport);

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    console.log('error', err);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
