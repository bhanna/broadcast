var express = require('express');
var mongoose = require( 'mongoose' );
var jwt = require('jsonwebtoken');
var _ = require('lodash');
var utils = require('./utils');
var async = require('async');

var List = mongoose.model('List');
var Recipient = mongoose.model('Recipient');

var router =  express.Router();

//TODO user friendly error handling

router.route('/')

	//create new list
	.post(function(req, res){

		var data = {};

		var user_id = utils.convertToObj(req.user._id);

		var list = new List();
		list.user_ids = [user_id];
		list.listName = req.body.listName;
		list.listDesc = req.body.listDesc;

		list.save(function(err, list){

			if (err) {
				//TODO make err user friendly
				console.log('err at list post', err);
				return res.send(500, err);
			}

			console.log('list posted');
			//data.message = 'Created List - ' + list.listName;
			data.list_id = list._id;
			return res.json(data);

		});

	});

router.route('/all')

	//return all lists for specific user
	.get(function(req, res){

		var user_id = utils.convertToObj(req.user._id);

		List.find({ user_ids : user_id }, function(err, data){
			if (err) {
				console.log('failed to get all lists', err);
				return res.status(500).send(err);
			}

			console.log('retrieved all lists');
			return res.send(data);

		});

	});

router.route('/:id')
		
	//get specified list
	.get(function(req, res){

		var data = {};

		//verify List exists
		List.findById(req.params.id, function(err, list){

			if (err) return res.status(500).send(err);

			console.log('list ', list);

			//find all Recipients in this list
			Recipient.find({list_ids: req.params.id}, function(err, recipients) {

				if (err) return res.status(500).send(err);
				data.recipients = recipients;
				data._id = list._id;
				console.log('recipients data ', data);
				return res.json(data);

			});

			//return res.json(list);

		});

	})

	.put(function(req, res) {

		List.findById(req.params.id, function(err, list) {

			if(err) {
				return res.status(500).send(err);	
			}

			list.listName = req.body.listName;
			list.listDesc = req.body.listDesc;

			list.save(function(err, list){

				if (err) {
					return res.status(500).send(err);
				}

				return res.json(list);

			});

		});

	})

	.delete(function(req,res) {

		var data = {}; 

		//find recipients associated with list
		Recipient.find({list_ids: req.params.id}, function(err, recipients) {

			if (err) return res.status(500).send(err);

			console.log('recipients in list ', recipients);

			//save recipients
			async.each(recipients, function(r, callback) {

				var new_ids = [];

				for (var i = 0, l = r.list_ids.length; i < l; i++) {
				  	if (r.list_ids[i] != req.params.id) {
					    new_ids.push(r.list_ids[i]);	
				  	}
				}

				console.log('new ids: ', new_ids);

				r.list_ids = new_ids;

				console.log('recipient ', r);
				
				r.save(function(err) {

					if (err) return res.status(500).send(err);

					console.log('saved recipient and removed list id ', req.params.id);
					callback();

				});


			}, function(err) {

				if (err) return res.status(500).send(err);

				//delete list
				//FUTURE if users share lists this should only remove the user_id from list.user_ids
				List.remove({
					_id: req.params.id
				}, function(err) {

					if (err) {
						return res.status(500).send(err);
					}

					data.message = 'List removed!';
					data.message_class = 'alert-success';
			        return res.json(data);

				});

			});

		
		});

	});



module.exports = router;