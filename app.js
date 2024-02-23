const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

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

app.post('/', function (req, res) {
    const username = req.body.username;
    const password = req.body.pass;

    if(username === 'admin' && password === 'ET132'){
        res.redirect('/cam-feed');
    } else {
        res.send("INCORRECT PASSWORD BOZO!");
    }
});

wss.on('connection', function connection(ws) {
    console.log('Client connected');

    ws.on('message', function incoming(data) {
        // Process received frame (e.g., save to file)
        saveFrame(data);
    });
});

function saveFrame(imageData) {
    // Decode base64 image data and save to file
    const buffer = Buffer.from(imageData.replace(/^data:image\/\w+;base64,/, ''), 'base64');
    fs.writeFile('frame.jpg', buffer, (err) => {
        if (err) {
            console.error('Error saving frame:', err);
        } else {
            console.log('Frame saved successfully');
        }
    });
}

const PORT = process.env.PORT || 3000;

server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});
