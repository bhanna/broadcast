var express = require('express');
var mongoose = require( 'mongoose' );
var jwt = require('jsonwebtoken');
var _ = require('lodash');
var config = require('../config/config');
var utils = require('./utils');

var Recipient = mongoose.model('Recipient');
var List = mongoose.model('List');
var User = mongoose.model('User');

var router =  express.Router();

//TODO add error handling for status 500
//TODO add validation for fields (phone number, email, etc in models)

router.route('/')
	
	//create recipient
	.post(function(req, res) {

		//TODO add create Recipient for a my-recipients section
		//TODO add user_id field so that my-recipients shows the User the correct recipients

	})
	
	//TODO return all recipients for specific user
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

router.route('/lists/add/:id')

	//create new recipient
	.post(function(req, res){
		var data = {};

		console.log('user: ', req.user);

		//verify List exists
		List.findById(req.params.id, function(err, list) {

			if (err) {
				console.log('err at find List: ', err);
				return res.status(500).send(err);
			}

			Recipient.findOne({phone: req.body.phone}, function(err, recipient) {

				if (err) return res.status(500).send(err);

				console.log('recipient found ', recipient);

				var user_id = utils.convertToObjId(req.user._id);
				
				//recipient exists
				if (recipient) {

					//check if recipient is alread part of the list
					if ( _.some(recipient.list_ids, list._id) ) {

						console.log('recipient already in list');
						data.message = recipient.firstName + ' is already part of this list!';
						return res.json(data);

					}
					else {

						//check if Recipient exists with this user_id
						if ( !_.some(recipient.user_ids, user_id) ) {
							
							console.log('userid NOT in array');
							//associate recipient with user_id
							recipient.user_ids.push(user_id);

							console.log('add userid: ', recipient.user_ids);

						}

						recipient.list_ids.push(list._id);
						console.log('recipient with new list_id ', recipient);
						
						recipient.save(function(err, recipient){

							if (err) {
								//TODO make err user friendly
								console.log('err at recipient post', err);
								return res.status(500).send(err);
							}

							console.log('recipient added to list');
							data.message = 'Added ' + recipient.firstName;
							return res.json(data);

						});

					}
					
				}
				//no recipient found
				else {

					//create Recipient AND add to list
					var r = new Recipient();
					
					r.user_ids = [user_id];
					r.list_ids = [list._id];
					r.firstName = req.body.firstName;
					r.email = req.body.email;
					r.phone = req.body.phone;

					console.log('recipient', r);

					
					r.save(function(err, recipient){

						if (err) {
							//TODO make err user friendly
							console.log('err at recipient post', err);
							return res.status(500).send(err);
						}

						console.log('recipient added and persisted');
						data.message = 'Added ' + recipient.firstName;
						return res.json(data);

					});

				}

			});
			
		});

	});

//remove recipient from list
router.route('/lists/remove/:id')
	.post(function(req, res) {

		var data = {};
		//verify List exists
		List.findById(req.params.id, function(err, list) {

			if (err) {
				console.log('err at find List: ', err);
				return res.status(500).send(err);
			}	
		
			Recipient.findById(req.body._id, function(err, recipient) {

				if (err) {
					console.log('err at find Recipient: ', err);
					return res.status(500).send(err);
				}

				var new_ids = [];

				//var new_ids = _.without(recipient.list_ids, req.params.id); //TODO WHY DOESN'T THIS WORK??

				console.log('params id ', req.params.id);
				for (var i = 0, l = recipient.list_ids.length; i < l; i++) {
				  	if (recipient.list_ids[i] != req.params.id) {
					    new_ids.push(recipient.list_ids[i]);	
				  	}
				}
				

				console.log('new ids: ', new_ids);

				recipient.list_ids = new_ids;

				console.log('recipient ', recipient);
				
				recipient.save(function(err) {

					if (err) return res.status(500).send(err);

					data.message = 'Removed recipient!';
					return res.json(data);

				});

			});

		});


	});


router.route('/:id')
	
	//get specified recipient
	.get(function(req, res){

		Recipient.findById(req.params.id, function(err, recipient) {

			if (err) {
				return res.status(500).send(err);
			}

			return res.json(recipient);

		});

	})

	.put(function(req, res) {

		//console.log('listItems id: ', req.params.id);
		var data = {};
		Recipient.findById(req.params.id, function(err, recipient) {

			if (err) {
				//console.log('err at find List: ', err);
				return res.status(500).send(err);
			}

			//TODO make this more efficient

			recipient.firstName = req.body.firstName;
			recipient.email = req.body.email;
			recipient.phone = req.body.phone;

			recipient.save(function(err) {

	        	if (err) return res.status(500).send(err);
	            
	            //console.log('tried to save update!');
	            data.message = 'Recipient updated!';
	            return res.json(data);

	        });

		});
	
	});

	/*//currently not in use
	//use /remove route
	.delete(function(req, res) {

		var data = {};
		Recipient.findById(req.params.id, function(err, recipient) {

			if (err) {
				console.log('err at find List: ', err);
				return res.send(err);
			}

			//TODO remove list id from list_ids
			//save recipient

		});
            
    });
	*/

module.exports = router;