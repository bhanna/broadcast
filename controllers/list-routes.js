var express = require('express');
var mongoose = require( 'mongoose' );
var jwt = require('jsonwebtoken');

var List = mongoose.model('List');

var router =  express.Router();

//TODO route through api and require jwt

router.route('/')

	//create new list
	.post(function(req, res){

		var data = {};

		var list = new List();
		list.listName = req.body.listName;
		list.listDesc = req.body.listDesc;

		//TODO save list under specific user object

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

	//return all lists
	.get(function(req, res){

		List.find(function(err, data){

			if (err) {
				console.log('failed to get all lists', err);
				return res.send(500, err);
			}

			console.log('retrieved all lists');
			return res.send(data);

		});

	});

router.route('/:id')
	
	//get specified list
	.get(function(req, res){

		List.findById(req.params.id, function(err, list){

			if (err) {
				return res.send(err);
			}

			return res.json(list);

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



module.exports = router;