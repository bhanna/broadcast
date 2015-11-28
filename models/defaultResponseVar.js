var mongoose = require('mongoose');

var defaultResponseVarSchema = new mongoose.Schema({

	responseStatus: {type: String, required: true},
	body: {type: String, required: true}

});

mongoose.model('DefaultResponseVar', defaultResponseVarSchema);