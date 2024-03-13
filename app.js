const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const path = require("path");
const fs = require("fs");
const io = require("socket.io")(http);
const sharp = require("sharp");
const os = require('os');
const { log } = require("console");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const socketio = require("socket.io")(server);
let receivedFrameData = null;
let numbersData=[];

let img_path='/images/room.jpeg';
let algo_map_path='/images/map-with-algo.png';


let imagePath='./public/images/room.jpeg';
var imageHeight, imageWidth;

app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  next();
});

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

function getServerIP() {
  const interfaces = os.networkInterfaces();

  for (const name of Object.keys(interfaces)) {
      for (const interface of interfaces[name]) {
          const {address, family, internal} = interface;

          if (family === 'IPv4' && !internal) {
              return address;
          }
      }
  }
  return 'localhost';
}

const server_ip = getServerIP();

sharp(imagePath)
  .metadata()
  .then(metadata => {
    const { width, height } = metadata;
    imageHeight=1*height;
    imageWidth=1*width;
  })
  .catch(err => {
    console.error('Error:', err);
  });


app.get("/cam-feed", function (req, res) {
  res.render("home",{server_ip: server_ip});
});

app.get("/", function (req, res) {
  res.render("login");
});


app.get("/receiver", function (req, res) {
  try {
    const numbersData = generateNumbersData();
    res.render("receiver", { imageData: receivedFrameData, numbersData: numbersData , img_path: img_path, algo_map_path: algo_map_path,imageHeight:imageHeight,imageWidth:imageWidth});
  } catch (error) {
    console.error("Error rendering template:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.post('/saveCoordinates', (req, res) => {
  const coordinates = req.body;

  const yamlData = `start_coordinate: [${coordinates.start.x},${coordinates.start.y}]
goal_coordinate: [${coordinates.end.x},${coordinates.end.y}]`;

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

  if (username === "et132" && password === "et132") {
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
