

var socketio = require('socket.io');

module.exports.listen = function(app){
    io = socketio.listen(app);

    incoming = io.of('/incoming');
    incoming.on('connection', function(socket){
       	
       	console.log('received incoming text and logged SOCKET');
    	//socket.emit('statusUpdate', thread);

    });

    return io;
};