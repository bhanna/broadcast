var express = require('express');
var mongoose = require( 'mongoose' );
var bodyParser = require('body-parser');
var incoming = require('../controllers/inbound-message');
var jwt = require('jsonwebtoken');

app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

//Set in env
if (!process.env) {

	var TWILIO_ACCOUNT_SID = 'ACb196d10158ca8e11fb1503c7c7c78f1e'; 
	var TWILIO_AUTH_TOKEN = '00c4b99ad4770a8167f79e5c4458c8f3'; 
	var TWILIO_NUMBER = '+14153001549';

}
else {

	var TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
	var TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
	var TWILIO_NUMBER = process.env.TWILIO_NUMBER;

}


//var client = require('twilio')(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
var Message = mongoose.model('Message');

var router =  express.Router();

// Twilio SMS webhook route
router.route('/incoming')
	
	.post(function(req, res) {

		var phone = req.body.From;
	    var responseMessage;
	    console.log('response from client: ', phone);

	    // Process any message the user sent to us
	    function processMessage(phone) {
	        // get the text message command sent by the user
	        var msg = req.body.Body || '';
	        msg = msg.toLowerCase().trim();
	        console.log('msg: ', msg);

	        // Conditional logic to do different things based on the command from
	        // the user
	        if (msg === 'yes' || msg === 'no') {
	            // If the user has elected to subscribe for messages, flip the bit
	            // and indicate that they have done so.
	            /*
	            subscriber.subscribed = msg === 'subscribe';
	            subscriber.save(function(err) {
	                if (err)
	                    return respond('We could not subscribe you - please try '
	                        + 'again.');

	                // Otherwise, our subscription has been updated
	                var responseMessage = 'You are now subscribed for updates.';
	                if (!subscriber.subscribed)
	                    responseMessage = 'You have unsubscribed. Text "subscribe"'
	                        + ' to start receiving updates again.';
	            
	                respond(responseMessage);
	            });*/
	            
	            if (msg === 'yes') {
	                responseMessage = 'word.';
	            }
	            if (msg === 'no') {
	                responseMessage = 'whaaaat?';
	            }
	            //respond(responseMessage);
	        } else {
	            // If we don't recognize the command, text back with the list of
	            // available commands
	            responseMessage = 'Come on now homie, available commands are: yes or no';

	            
	        }
	        respond(responseMessage);
	        console.log('attempting to respond with: ', responseMessage);
			
	        // Set Content-Type response header and render XML (TwiML) response in a 
		    // Jade template - sends a text message back to user
		    function respond(message) {
		        console.log('redirecting to twiml to respond with: ', message);
		        res.type('text/xml');
		        res.render('twiml', {
		            message: message
		        });
		    }
		    
		}
	});

router.route('/')
	
	//get all messages
	.get(function(req, res) {

		//TODO get all messages

	})
	.post(function(req, res) {

		var data = {};
		var message = new Message();
		message.to = req.body.to;
		message.title = req.body.title;
		message.body = req.body.body;

		//TODO save message under specific user object

		message.save(function(err, message){

			//TODO make errors user friendly

			if (err) {
				console.log('err at saving Message', err);
				return res.send(500, err);
			}

			client.sendSms({
			    to:'+1' + message.to,
			    from: TWILIO_NUMBER,
			    body: message.body
			}, function(error, message) {
			    // The HTTP request to Twilio will run asynchronously. This callback
			    // function will be called when a response is received from Twilio
			    // The "error" variable will contain error information, if any.
			    // If the request was successful, this value will be "falsy"
			    if (!error) {
			        // The second argument to the callback will contain the information
			        // sent back by Twilio for the request. In this case, it is the
			        // information about the text messsage you just sent:
			        console.log('Success! The SID for this SMS message is:');
			        console.log(message.sid);
			 
			        console.log('Message sent on:');
			        console.log(message.dateCreated);
			    } else {
			        console.log('Oops! There was an error.');
			    }
			});

			console.log('message posted', message.to);
			data.to = message.to;
			return res.json(data);

		});

		
	});

module.exports = router;