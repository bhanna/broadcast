var mongoose = require('mongoose');

var counterSchema = new mongoose.Schema({
    
    user_id: { type : mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    seq: { type: Number, default: 0 }

});

var Counter = mongoose.model('Counter', counterSchema);