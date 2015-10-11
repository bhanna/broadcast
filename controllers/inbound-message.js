var express = require('express');
var mongoose = require( 'mongoose' );
var jwt = require('jsonwebtoken');

// Create a function to handle Twilio SMS / MMS webhook requests

exports.webhook = function(req, res) {
    console.log('reached incoming');
    /*
    // Get the user's phone number
    var phone = request.body.From;

    // Try to find a subscriber with the given phone number
    Subscriber.findOne({
        phone: phone
    }, function(err, sub) {
        if (err) return respond('Derp! Please text back again later.');

        if (!sub) {
            // If there's no subscriber associated with this phone number,
            // create one
            var newSubscriber = new Subscriber({
                phone: phone
            });

            newSubscriber.save(function(err, newSub) {
                if (err || !newSub) 
                    return respond('We couldn\'t sign you up - try again.');

                // We're signed up but not subscribed - prompt to subscribe
                respond('Thanks for contacting us! Text "subscribe" to ' +
                    + 'receive updates via text message.');
            });
        } else {
            // For an existing user, process any input message they sent and
            // send back an appropriate message
            processMessage(sub);
        }
    });
    */
    var phone = req.body.From;
    var responseMessage;
    console.log('response from client: ', phone);
    // Process any message the user sent to us
    function processMessage(phone) {
        // get the text message command sent by the user
        var msg = request.body.Body || '';
        msg = msg.toLowerCase().trim();

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
    }

    // Set Content-Type response header and render XML (TwiML) response in a 
    // Jade template - sends a text message back to user
    function respond(message) {
        console.log('redirecting to twiml to respond with: ', message);
        response.type('text/xml');
        response.render('twiml', {
            message: message
        });
    }
};

/*
// Handle form submission
exports.sendMessages = function(request, response) {
    // Get message info from form submission
    var message = request.body.message;
    var imageUrl = request.body.imageUrl;

    // Use model function to send messages to all subscribers
    Subscriber.sendMessage(message, imageUrl, function(err) {
        if (err) {
            request.flash('errors', err.message);
        } else {
            request.flash('successes', 'Messages on their way!');
        }

        response.redirect('/');
    });

};
*/