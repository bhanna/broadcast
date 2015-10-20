var express = require('express');
var router = express.Router();


//TODO add auth
//TODO add user

//Define routes
//var auth = require('./auth');
router.use('/lists', require('./list-routes'));
router.use('/recipients', require('./recipient-routes'));
router.use('/broadcasts', require('./broadcast-routes'));


/* GET home page. */
router.get('/', function(req, res, next) {
	console.log('hello');
  res.render('index', { title: 'Express' });
});

module.exports = router;
