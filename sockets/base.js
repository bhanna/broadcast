

var socketio = require('socket.io');

module.exports.listen = function(server){
    io = socketio.listen(server);

    incoming = io.of('/incoming');
    incoming.on('connection', function(socket){
       	
       	console.log('*** RECEIVED SOCKET ***');
    	//socket.emit('statusUpdate', thread);

    });

    return io;
};