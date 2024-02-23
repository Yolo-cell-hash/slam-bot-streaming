const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const fs = require('fs');
const io = require('socket.io')(http); // Initialize Socket.IO


const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const socketio = require('socket.io')(server);
const server_ip = '192.168.1.101';
let receivedFrameData = null;

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

app.get('/receiver', function(req, res) {
    res.render('receiver', { imageData: receivedFrameData });
});

app.post('/', function (req, res) {
    const username = req.body.username;
    const password = req.body.pass;
    const clientIP = req.ip;

    if(username === 'admin' && password === 'ET132'){
        if(clientIP === server_ip){
            res.redirect('/cam-feed');
        }else{
            res.redirect("/receiver");
        }
    } else {
        res.send("INCORRECT PASSWORD BOZO!");
    }
});

// WebSocket connection handling
// wss.on('connection', function connection(ws) {
//     console.log('Client connected.');

//     ws.on('message', function incoming(imageData) {
//         console.log('Received frame from client.');
//         // Here you can handle the received frame data
//         // For example, you can save it to a file, process it, or broadcast it to other clients
//         // For simplicity, let's just log the received message
//         console.log(imageData);
//         io.emit('frame', imageData);

//     });

//     ws.on('close', function close() {
//         console.log('Client disconnected.');
//     });
// });

wss.on('connection', function connection(ws) {
    console.log('Client connected.');

    ws.on('message', function incoming(imageData) {
        console.log('Received frame from client.');
        console.log(imageData);
        receivedFrameData = imageData;
        socketio.emit('frame', imageData); // Emit the frame data using Socket.IO
    });

    ws.on('close', function close() {
        console.log('Client disconnected.');
    });
});



const PORT = process.env.PORT || 3000;

server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});
