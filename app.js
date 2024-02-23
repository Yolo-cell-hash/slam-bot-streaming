const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const server_ip = '192.168.1.101';

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
    res.render('receiver');
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

function saveFrame(imageData) {
    const buffer = Buffer.from(imageData.replace(/^data:image\/\w+;base64,/, ''), 'base64');
    fs.writeFile('frame.jpg', buffer, (err) => {
        if (err) {
            console.error('Error saving frame:', err);
        } else {
            console.log('Frame saved successfully');
        }
    });
}

wss.on('connection', function connection(ws) {
    console.log('Client connected');

    ws.on('message', function incoming(data) {
        // Process received frame (e.g., save to file)
        saveFrame(data);
    });
});



const PORT = process.env.PORT || 3000;

server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});
