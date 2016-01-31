var mongoose = require('mongoose');

var broadcastCounterSchema = new mongoose.Schema({
    
    user_id: { type : Number, ref: 'User', required: true },
    seq: { type: Number, default: 0 }

});

var Counter = mongoose.model('BroadcastCounter', broadcastCounterSchema);