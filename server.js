// HTTP Portion
var http = require('http');
var fs = require('fs'); // Using the filesystem module
var httpServer = http.createServer(requestHandler);
httpServer.listen(8080);

function requestHandler(req, res) {
	// Read index.html
	fs.readFile(__dirname + '/index.html', 
		// Callback function for reading
		function (err, data) {
			// if there is an error
			if (err) {
				res.writeHead(500);
				return res.end('Error loading canvas_socket.html');
			}
			// Otherwise, send the data, the contents of the file
			res.writeHead(200);
			res.end(data);
  		}
  	);
}


// WebSocket Portion
// WebSockets work with the HTTP server
var io = require('socket.io').listen(httpServer);

var imgQueue = [ ];

// Register a callback function to run when we have an individual connection
// This is run for each individual user that connects
io.sockets.on('connection', 

	// We are given a websocket object in our function
	function (socket) {
	
		console.log("We have a new client: " + socket.id);

		//TODO: socket.myid = whatever...

		// When this user emits, client side: socket.emit('otherevent',some data);
		socket.on('chatmessage', function(data) {
			// Data comes in as whatever was sent, including objects
			console.log("Received: 'chatmessage' " + data.user + data.chat);
			
			imgQueue.push(data);

			console.log(imgQueue);

			//if it's the first image submitted, send it right back
			if (imgQueue.length == 1){
				socket.broadcast.emit('firstSubmit', imgQueue[0]);
			}
		});
		
		socket.on('disconnect', function() {
			console.log("Client has disconnected " + socket.id);
		});
	}
);


var shift = function() {
	//only execute this function if there is more than 1 item in the queue, otherwise do nothing
	if (imgQueue.length > 1) { 
            //shift moves the oldest item in our imgQueue array to currentImage, and delete it from the array 
        imgQueue.shift(); 
			console.log("THE ARRAY HAS SHIFTED! the oldest item in the queue is = " + imgQueue[0]);
    }  else {
    	return;
    }

    io.sockets.emit('chatmessage', imgQueue[0]); //send oldest item in the queue to everyone
}

setInterval(shift, 10000); //this actually runs the 'timer'



