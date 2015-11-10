//config file

exports = module.exports = {};

//database connection
exports.secret = 'aAEmc(#-)CK_)KcSLdc_-0-0283';

//Set in env
if (!process.env.TWILIO_ACCOUNT_SID) {

	var TWILIO_ACCOUNT_SID = 'ACb196d10158ca8e11fb1503c7c7c78f1e';
	var TWILIO_AUTH_TOKEN = '00c4b99ad4770a8167f79e5c4458c8f3';
	var TWILIO_NUMBER = '+14153001549';

}
else {

	var TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
	var TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
	var TWILIO_NUMBER = process.env.TWILIO_NUMBER;

}


exports.TWILIO_ACCOUNT_SID = TWILIO_ACCOUNT_SID; 
exports.TWILIO_AUTH_TOKEN = TWILIO_AUTH_TOKEN; 
exports.TWILIO_NUMBER = TWILIO_NUMBER;