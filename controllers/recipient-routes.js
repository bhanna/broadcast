var express = require('express');
var mongoose = require( 'mongoose' );
var jwt = require('jsonwebtoken');

var Recipient = mongoose.model('Recipient');
var List = mongoose.model('List');

var router =  express.Router();

//TODO route through api and require jwt
//TODO add error handling for status 500
//TODO add validation for fields (phone number, email, etc in models)

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

router.route('/single')

	//create new recipient
	.post(function(req, res){

		var data = {};

		//create Recipient (child Schema)
		var recipient = new Recipient();
		recipient.firstName = req.body.firstName;
		recipient.email = req.body.email;
		recipient.phone = req.body.phone;

		console.log('recipient', recipient);
		//TODO save recipient under specific user object

		//push to List (parent Schema)
		List.findById(req.query.list_id, function(err, list) {

			if (err) {
				console.log('err at find List: ', err);
				return res.status(500).send(err);
			}
			list.listItems.push(recipient);
			var subdoc = list.listItems[0];
			console.log('new recipient: ', subdoc);
			console.log('list ', list);
			
			list.save(function(err, list){

				if (err) {
					console.log('err at recipient post', err);
					return res.status(500).send(err);
				}

				console.log('recipient posted');
				data.message = 'Added ' + req.body.firstName;
				return res.json(data);
			});
			
		});
		
		/*
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
*/

	});


router.route('/:id')
	
	//get specified recipient
	.get(function(req, res){

		List.findById(req.query.list_id, function(err, list) {

			if (err) {
				return res.send(err);
			}

			recipient = list.listItems.id(req.params.id);

			return res.json(recipient);

		});

	})

	.put(function(req, res) {

		//console.log('listItems id: ', req.params.id);
		var data = {};
		List.findById(req.query.list_id, function(err, list) {

			if (err) {
				//console.log('err at find List: ', err);
				return res.send(err);
			}

			var recipient = list.listItems.id(req.params.id);

			//TODO make this more efficient

			recipient.firstName = req.body.firstName;
			recipient.email = req.body.email;
			recipient.phone = req.body.phone;

			list.save(function(err) {

	        	if (err) {
	                return res.send(err);
	            }
	            //console.log('tried to save update!');
	            data.message = 'Updated recipient';
	            return res.json(data);

	        });

		});
	
	})

	.delete(function(req, res) {

		var data = {};
		List.findById(req.query.list_id, function(err, list) {

			if (err) {
				console.log('err at find List: ', err);
				return res.send(err);
			}

			list.listItems.id(req.params.id).remove();

			list.save(function(err) {

	        	if (err) {
	                return res.send(err);
	            }

	            data.message = 'Removed recipient';
	            return res.json(data);

	        });

		});
            
    });


module.exports = router;