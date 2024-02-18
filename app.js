const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const { Client } = require('ssh2');


const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());



app.get('/cam-feed', function(req, res) {
    res.render('home');
});

app.get('/', function(req, res) {
    res.render('login');
});



io.on('connection', socket => {
    console.log('A user connected');

    socket.on('stream', stream => {
        // Broadcast the stream to all clients except the sender
        socket.broadcast.emit('stream', stream);
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});


//Login Logic
app.post('/', function (req, res) {
    const username = req.body.username;
    const password = req.body.pass;

    if(username=='admin' && password=='ET132'){
        res.redirect('/cam-feed');
    }else{
        res.send("INCORRECT PASSWORD BOZO!");
    }
});
  
 
  

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
