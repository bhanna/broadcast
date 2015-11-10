var mongoose = require('mongoose');


var Counter = mongoose.model('Counter');

//broadcast (list for individual broadcast threads)
var broadcastSchema = new mongoose.Schema({

	//have array of user_ids in case users eventually want to share broadcasts
	user_ids: [{ type : mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
	broadcast_id: {type: Number},
	title: {type: String, required: true},
	body: {type: String, required: true},
	numPositions: {type: Number, required: true}, //Needed for filling positions
	openPositions: {type: Number, required: true}, //Needed to track filled positions
	listID: String,
	created_at: {type: Date, default: Date.now}

	//TODO add a user_id to associate rather than keep as a subdoc

});

//auto increment jobs
//TODO verify finding by correct user_id
broadcastSchema.pre('save', function(next) {

	if (!this.isNew) {
		return next();
	}
	
    var doc = this;
    console.log('doc.user_ids[0] ', doc.user_ids[0]);
    Counter.findOneAndUpdate({user_id: doc.user_ids[0]}, {$inc: { seq: 1}}, {'new': true}, function(error, counter)   {
        
        if(error) return next(error);

        console.log('counter seq ', counter.seq);
        console.log('COUNTER ', counter);
        doc.broadcast_id = counter.seq;
        console.log('doc broadcast_id ', doc.broadcast_id);
        doc.body = doc.body + ' Yes' + doc.broadcast_id + ' or No' + doc.broadcast_id;
        next();
    });
});


mongoose.model('Broadcast', broadcastSchema);