var express = require('express');
var mongoose = require( 'mongoose' );
var jwt = require('jsonwebtoken');

var Recipient = mongoose.model('Recipient');

var router =  express.Router();

//TODO route through api and require jwt

router.route('/single')

	//create new recipient
	.post(function(req, res){

		var data = {};

		var recipient = new Recipient();
		recipient.firstName = req.body.firstName;
		recipient.lastName = req.body.lastName;
		recipient.email = req.body.email;

		//TODO save recipient under specific user object

		recipient.save(function(err, recipient){

			if (err) {
				//TODO make err user friendly
				console.log('err at recipient post', err);
				return res.send(500, err);
			}

			console.log('recipient posted');
			data.message = 'Recieved ' + recipient.firstName;
			return res.json(data);

		});

	});


router.route('/:id')
	
	//get specified recipient
	.get(function(req, res){

		Recipient.findById(req.params.id, function(err, recipient){

			if (err) {
				return res.send(err);
			}
			return res.json(recipient);

		});

	});

router.route('/')
	
	//return all recipients
	.get(function(req, res){

		Recipient.find(function(err, data){

			if (err) {
				console.log('failed to get all Recipients', err);
				return res.send(500, err);
			}

			console.log('retrieved all Recipients');
			return res.send(data);

		});

	});

module.exports = router;