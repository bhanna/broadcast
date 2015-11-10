//utilities used by multiple modules
var _ = require('lodash');
var mongoose = require('mongoose');

exports.belongsToUser = function(model, query, user_id) {

	model.find(query, function(err, model) {

		if (err) return 'err at belongsToUser ', err;

		if ( _.some(model.user_ids, user_id) ) {

			return 'yes';

		}
		else {

			return 'no';

		}

	});

};

exports.convertToObj = function(val) {

	//cast user_id as object to interact with db
	var converted = mongoose.Types.ObjectId(val);

	return converted;

};