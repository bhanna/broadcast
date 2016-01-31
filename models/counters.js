var mongoose = require('mongoose');

var countersSchema = new mongoose.Schema({
    
    seq: { type: Number, default: 0 }

});

var Counters = mongoose.model('Counters', countersSchema);