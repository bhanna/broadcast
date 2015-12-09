var mongoose = require('mongoose');

var Counter = mongoose.model('Counter');

//user
var userSchema = new mongoose.Schema({
    email: {type: String, required: true},
    password: {type: String, required: true}, 
    created_at: {type: Date, default: Date.now},
    role: {type: String, required: true},
  	//lists: [{ type : mongoose.Schema.Types.ObjectId, ref: 'List' }],
  	//broadcasts: [{ type : mongoose.Schema.Types.ObjectId, ref: 'Broadcast' }]

});

//create new Counter each User
userSchema.pre('save', function(next) {

	if (!this.isNew) {
		return next();
	}
		
	var doc = this;

    var counter = new Counter();

    counter.user_id = doc._id;
    counter.save(function(err) {

    	if (err) return next(err);
    	return next();

    });

});

mongoose.model('User', userSchema);