var express = require('express');
var router = express.Router();

//CURRENTLY NOT IN USE 
//ALL ROUTES ARE IN APP.JS BECAUSE OF SOCKET IO
//Define routes
router.use('/incoming', require('./incoming'));
router.use(require('./protected-routes'));
router.use('/users', require('./user-routes'));
router.use('/admin', require('./admin-routes'));
router.use('/api/protected/lists', require('./list-routes'));
router.use('/api/protected/recipients', require('./recipient-routes'));
router.use('/api/protected/broadcasts', require('./broadcast-routes'));
router.use('/api/protected/user-accounts', require('./user-account-routes'));
router.use('/api/protected/customResponses', require('./customResponses-routes'));


/* GET home page. */
router.get('/', function(req, res, next) {
	console.log('hello');
  res.render('index', { title: 'Express' });
});

module.exports = router;
