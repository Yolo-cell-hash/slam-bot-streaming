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


//SSH LOGIC
app.post('/', function (req, res) {
    const username = req.body.username;
    const password = req.body.pass;
    const ip_address = req.body.ip_address;

    // SSH Connection options
    const sshConfig = {
        host: ip_address,
        port: 22,
        username: username,
        password: password
    };

    const conn = new Client();

    // Connect to the SSH server
    conn.on('ready', function () {
        console.log('SSH connection established.');

        // Once connected, you can execute commands
        conn.exec('ls', function (err, stream) {
            if (err) throw err;

            stream.on('close', function (code, signal) {
                console.log('Stream :: close :: code: ' + code + ', signal: ' + signal);
                conn.end(); // Close the connection once done
            }).on('data', function (data) {
                console.log('STDOUT: ' + data);
                // Here you can send data back to the client if needed
            }).stderr.on('data', function (data) {
                console.log('STDERR: ' + data);
                // Handle STDERR data
            });
        });
    }).connect(sshConfig);
});
  
 
  

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
