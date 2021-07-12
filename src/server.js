const express = require("express");
const app = express();

const jwt = require("jsonwebtoken");
const User = require("../models/User");
const authRoutes = require("../routes/authRoutes");
const cookieParser = require("cookie-parser");
const { requireAuth, checkUser } = require("../middleware/authMiddleware");

const { v4: uuidV4 } = require("uuid");
const server = require("http").Server(app);
const io = require("socket.io")(server);
const { ExpressPeerServer } = require("peer");
const PeerServer = ExpressPeerServer(server, {
  debug: true,
});
const generatemsg = require("./utils/message");


// view engine
app.set("view engine", "ejs");


// peerjs connection
app.use("/peerjs", PeerServer);


// middleware
app.use(express.json());
app.use(express.static("public"));
app.use(cookieParser());

var PeerPort;

if (process.env.NODE_ENV !== "production") {
  PeerPort = 7000;
  require("dotenv").config();
  console.log("running in dev");
} else {
  PeerPort = 443;
  console.log("Running in production");
}


// routes
app.get("*", checkUser);

app.get("/", requireAuth, (req, res) => {
  res.render("home");
});

app.get("/room", requireAuth, (req, res) => {
  var roomId = uuidV4();
  res.redirect("/" + roomId);
});

app.get("/landing", requireAuth, (req, res) => {
  // console.log(user.username);
  res.render("landing");
});

app.use(authRoutes);

app.get("/:idroom", requireAuth, (req, res) => {
  const token = req.cookies.jwt;
  if (token) {
    jwt.verify(token, process.env.SECRET_KEY, async (err, decodedtoken) => {
      if (err) {
        console.log(err);
      } else {
        const user = await User.findById(decodedtoken.id);
        res.render("room", {
          username: user.username,
          roomId: req.params.idroom,
          PeerPort
        });
      }
    });
  } else {
    res.redirect("/login");
  }
});


// Socket-io connection
io.on("connection", (socket) => {
  socket.on("join-room", (username, roomId, userId) => {
    socket.join(roomId);
    socket.emit("show_msg", generatemsg("Admin", "Welcome"));
    socket.broadcast
      .to(roomId)
      .emit("show_msg", generatemsg("Admin", `${username} has joined`));
    socket.broadcast.to(roomId).emit("user-connected", username, userId);
    socket.on("message", (msg) => {
      io.to(roomId).emit("show_msg", generatemsg(username, msg));
    });

    socket.on("disconnect", () => {
      socket.broadcast.to(roomId).emit("user-disconnected", userId);
      socket.broadcast
        .to(roomId)
        .emit("show_msg", generatemsg("Admin", `${username} has left`));
    });
  });
});

// Database Connection
const connectDB = require("../Database connection/connectDB");
connectDB();


const port=process.env.PORT || 7000


server.listen(port, ()=>{
  console.log(`server is listening on port ${port}`);
})