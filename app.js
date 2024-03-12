const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const path = require("path");
const fs = require("fs");
const io = require("socket.io")(http);
const sharp = require("sharp");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const socketio = require("socket.io")(server);
const server_ip = "192.168.1.101";
let receivedFrameData = null;
let numbersData=[];

let img_path='/images/room.jpg';
let algo_map_path='/images/algo-map.jpeg';

app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  next();
});

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


app.get("/cam-feed", function (req, res) {
  res.render("home");
});

app.get("/", function (req, res) {
  res.render("login");
});


app.get("/receiver", function (req, res) {
  try {
    const numbersData = generateNumbersData();
    res.render("receiver", { imageData: receivedFrameData, numbersData: numbersData , img_path: img_path, algo_map_path: algo_map_path});
  } catch (error) {
    console.error("Error rendering template:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.post('/saveCoordinates', (req, res) => {
  const coordinates = req.body;

  // Convert coordinates to YAML format
  const yamlData = `start_coordinate:[${coordinates.start.x},${coordinates.start.y}]
goal_coordinate:[${coordinates.end.x},${coordinates.end.y}]`;

  // Write YAML data to a file
  fs.writeFileSync('coordinates.yaml', yamlData);

  res.send('Coordinates saved successfully!');
});





function generateNumbersData() {
  const numbersData = [];
  for (let i = 0; i <= 360; i++) {
      const randomNumber = Math.floor(Math.random() * 10) + 1;
      numbersData.push({ number: i, randomNumber: randomNumber });
  }
  return numbersData;
}

app.post("/", function (req, res) {
  const username = req.body.username;
  const password = req.body.pass;
  const clientIP = req.ip;

  if (username === "admin" && password === "ET132") {
    if (clientIP === server_ip) {
      res.redirect("/cam-feed");
    } else {
      res.redirect("/receiver");
    }
  } else {
    res.send("INCORRECT PASSWORD BOZO!");
  }
});

wss.on("connection", function connection(ws) {
  console.log("Client connected.");

  ws.on("message", function incoming(imageData) {
    //console.log('Received frame from client.');
    //console.log(imageData);
    receivedFrameData = imageData;

    socketio.emit("frame", imageData);
  });

  ws.on("close", function close() {
    console.log("Client disconnected.");
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`);
});
