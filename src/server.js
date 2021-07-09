const express=require('express');
const app=express();
const mongoose=require('mongoose');
const authRoutes=require('../routes/authRoutes');
const cookieParser=require('cookie-parser');
const {requireAuth,checkUser}=require('../middleware/authMiddleware');

const server = require("http").Server(app);
const { v4: uuidV4 } = require("uuid");
const io = require("socket.io")(server);
const { ExpressPeerServer } = require("peer");
const PeerServer = ExpressPeerServer(server, {
  debug: true,
});
const jwt=require('jsonwebtoken');
const User=require('../models/User');
const generatemsg=require('./utils/message');

// view engine
app.set('view engine','ejs');


// peerjs connection
app.use('/peerjs',PeerServer);


// middleware
app.use(express.json());
app.use(express.static("public"));
app.use(cookieParser());


// routes
app.get("*", checkUser);
app.get('/',requireAuth,(req,res)=>{
  res.render('home');
})

app.get('/room',requireAuth,(req,res)=>
{
    var roomId=uuidV4();
    res.redirect('/'+roomId);
});

app.get("/landing", requireAuth, (req, res) => {
  // console.log(user.username);
  res.render("landing");
});

app.use(authRoutes);

app.get('/:idroom',requireAuth,(req,res)=>
{
  const token=req.cookies.jwt;
  if(token)
    {
      jwt.verify(token,'rip is a good boy',async(err,decodedtoken)=>{
        if(err)
          {
            console.log(err);
          }      
        else  
          {
              const user=await User.findById(decodedtoken.id);
              res.render("room", { username:user.username, roomId: req.params.idroom });
          }
      })
    }
  else
    {
      res.redirect('/login');
    }
});


io.on('connection',socket=>{
    socket.on('join-room',(username,roomId,userId)=>{
        socket.join(roomId);
        socket.emit("show_msg",generatemsg("Admin","Welcome"));
        socket.broadcast.to(roomId).emit("show_msg",generatemsg("Admin",`${username} has joined`));
        socket.broadcast.to(roomId).emit('user-connected',username,userId);
        socket.on('message',msg=>{
            io.to(roomId).emit("show_msg",generatemsg(username,msg));
        });

        socket.on("disconnect", () => {
          socket.broadcast.to(roomId).emit("user-disconnected", userId);
        socket.broadcast
          .to(roomId)
          .emit("show_msg", generatemsg("Admin", `${username} has left`));
        });
    });
});



// database connection 
const dbURI =
  "mongodb+srv://Rip:ripunjoysarma@video-app.aa78e.mongodb.net/video-app";
mongoose
  .connect(dbURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .then((result) =>
    server.listen(7000, () => {
      console.log("server is listening on port 7000");
    })
  )
  .catch((err) => console.log(err));
