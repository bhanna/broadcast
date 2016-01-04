var express = require('express');
var mongoose = require( 'mongoose' );
var async = require('async');
var jwt = require('jsonwebtoken');
var utils = require('./utils');
var outgoing = require('./utils.outgoing');
var config = require('../config/config');

var app = require('../app');
var io = app.io;

var Broadcast = mongoose.model('Broadcast');
var BroadcastThread = mongoose.model('BroadcastThread');
var Response = mongoose.model('Response');
var List = mongoose.model('List');
var Recipient = mongoose.model('Recipient');

var router =  express.Router();

//TODOs
//Put finding different Statuses in a function
//Put parsing Statuses in a function
//Put incoming in a function
//Put outgoing in a function
//clean up all errors to make user friendly
//create Owner class with respond() method
//create Recipient class with respond() method


module.exports = function (io) {


router.route('/')

	//create broadcast and broadcastThreads
	.post(function(req, res) {

		//TODO save broadcast under specific user object

		//get user_id
		var user_id = utils.convertToObjId(req.user._id);
		console.log('USERID from pre waterfall ', user_id);

		async.waterfall([
				
				//create Broadcast
				function(callback) {
					console.log('req.body ', req.body);
					console.log('req.user ', req.user);
					
					//returns saved broadcast
					outgoing.createBroadcast(req.body, user_id, callback);
					//console.log('data: ', data);
					//callback(null, data);
				},				
				//prepare BroadcastThreads by getting List or sending Single
				function(data, callback) {
					console.log('created broadcast: ', data);
					
					//returns broadcast and recipients
					outgoing.prepareBroadcastThreads(data, callback);
				},
				//create BroadcastThreads
				function(data, callback) {
					console.log('prepared threads(s): ', data);
					
					//returns message and messageClass
					outgoing.createBroadcastThreads(data, callback);
				},
				
			], function(err, results) {
					if (err) {
						console.log('create broadcast and broadcast threads err: ', err);
						return res.status(500).send(err);
					}
					console.log('success message: ', results);
					return res.json(results);
				});


	});


router.route('/:id')

	.get(function(req, res) {

		//set return variable
		var data = {};

		//get user_id
		var user_id = utils.convertToObjId(req.user._id);

		var query;

		if (req.query.openPositions) {
			query = 'openPositions';
		}
		else if (req.query.title) {
			query = 'title';
		}

		//TODO get open Broadcast by ID
		//TODO make this a flexible query according to req.query values
		//Can we do a { query: true } return?
		Broadcast.findOne({broadcast_id: req.params.id, user_ids: user_id}, function(err, broadcast) {

			if (err) {
				console.log('faled to get broadcast');
				return res.status(500).send(err);
			}

			if (query == 'openPositions') {
				data = broadcast.openPositions;
			}
			else if (query === 'title') {
				data = broadcast.title;
			}
			else {
				data = broadcast;
			}
		
			console.log('broadcast from open/id data ', data);
			return res.json(data);

		});

	});

router.route('/outgoing')

	.post(function(req, res) {

		console.log('req.query, ', req.query);
		outgoing.updateBroadcastThread(req, res, req.body, req.query);
			
	});


router.route('/open/all')

	.get(function(req, res) {

		//console.log('io: ', io);
		io.on('connection', function(socket) {

			console.log('SOCKET FROM BROADCASTS');

		});

		//get user_id
		var user_id = utils.convertToObjId(req.user._id);

		//get all Broadcasts where openPositions != 0
		//TODO add add user_id field to show only User's Broadcasts
		Broadcast.find({ openPositions: {$gt: 0}, user_ids: user_id }, { __v: false }, function(err, data){

			if (err) {
				console.log('failed to get open broadcasts', err);
				return res.status(500).send(err);
			}

			console.log('retrieved open broadcasts');
			return res.json(data);

		});

	});


router.route('/threads/:id')

	.get(function(req, res) {

		//get user_id
		var user_id = utils.convertToObjId(req.user._id);

		console.log('user id: ', user_id);

		//set return variable
		var data = {};

		BroadcastThread.find({broadcast_id: req.params.id, user_ids: user_id}, function(err, threads) {

			if (err) {

				console.log('error at threads ', err);
				return res.status(500).send(err);
			}

			console.log('got threads with id ' + req.params.id + ': ' + threads);
			return res.json(threads);

		});

	});

router.route('/filled/all')

	.get(function(req, res) {

		//get user_id
		var user_id = utils.convertToObjId(req.user._id);

		//get all Broadcasts where openPositions != 0
		//TODO add add user_id field to show only User's Broadcasts
		Broadcast.find({ openPositions: 0, user_ids: user_id}, { __v: false }, function(err, data){

			if (err) {
				console.log('failed to get filled broadcasts', err);
				return res.status(500).send(err);
			}

			console.log('retrieved filled broadcasts');
			return res.json(data);

		});

	});

	return router;
};
//module.exports = router;