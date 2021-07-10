const socket=io("/");


var Newpeer=new Peer(undefined,{
    path: '/peerjs',
    host:'/',
    port:PeerPort
})

Newpeer.on('open',id=>{
    socket.emit('join-room',Username,ROOM_ID,id);
});

const peers = {};

const videoGrid=document.getElementById('video-grid');
var H=document.createElement('h3');
const myVideo=document.createElement('video');
const myVideoDiv=document.createElement('div');
myVideo.muted=true;

let myvideoStream;

navigator.mediaDevices.getUserMedia({
    video:true,
    audio:true
}).then((stream) => {
  var currentName=Username;
  myvideoStream = stream;
  addVideoStream(myVideoDiv, myVideo, stream);
  addIdToMyVideo(myVideo,H,currentName);
  
  // answering the call
  Newpeer.on("call", (call) => {
    var currentName = Username;
    //Answering the call by sending out stream
    call.answer(stream);
    var videoDiv = document.createElement("div");
    var video = document.createElement("video");
    var h1 = document.createElement("h3");
    call.on("stream", (userVideoStream) => {
      addOtherVideoStream(
        videoDiv,
        video,
        h1,
        userVideoStream,
        call.options.metadata.name
      );
    });
    call.on("close", function () {
      // console.log("removing User",video.nextElementSibling);
      video.remove();
      h1.remove();
      videoDiv.remove();
    });
  });

  socket.on("user-connected", (username,userId) => {
    // console.log(userId);
    console.log(username);
    connectToNewUser(userId, stream,username);
  });

  let text = $("input");

  $("html").keydown(function(e){
    if (e.which == 13 && text.val().length !== 0) {
      socket.emit("message", text.val());
      text.val("");
    }
  });

  socket.on("show_msg", (msg) => {
    console.log(msg.text);
    $("ul").append(`<li class="message"><span class="user">${msg.username}</span><br/><span class="msg_txt">${msg.text}</span></li>`);
    scrollToBottom();
  });
});

socket.on("user-disconnected", (userId) => {
  if (peers[userId]) {
    peers[userId].close();
  }
});


const connectToNewUser = (userId,stream,username) =>{
    // call the other user
    // const call=Newpeer.call(userId,stream,{metadata:{name:Username}});
    const call = Newpeer.call(userId, stream, { metadata: { name: Username } });
    const video=document.createElement('video');
    const videoDiv=document.createElement('div');
    var h1=document.createElement('h3');
    var conn=Newpeer.connect(userId);

    call.on('stream',userVideoStream=>{
        addOtherVideoStream(videoDiv,video,h1,userVideoStream,username);
    });
    call.on("close", () => {
      video.remove();
      h1.remove();
      videoDiv.remove();
    });
    peers[userId] = call;
};



const addVideoStream = (videoDiv,video, stream) =>{
    video.srcObject = stream;
    video.addEventListener("loadedmetadata",()=>{
        video.play();
    });
    videoDiv.append(video);
    videoGrid.append(videoDiv);
}

const muteUnmute = () => {
  let enabled = myvideoStream.getAudioTracks()[0].enabled;
  if (enabled) {
    myvideoStream.getAudioTracks()[0].enabled = false;
    setUnmuteButton();
  } else {
    setMuteButton();
    myvideoStream.getAudioTracks()[0].enabled = true;
  }
};

const setMuteButton = () => {
  const html = `<i class="fas fa-microphone"></i>
  <span>Mute</span>`;
  document.querySelector(".main__mute__button").innerHTML = html;
};

const setUnmuteButton = () => {
  const html = `<i class="unmute fas fa-microphone-slash"></i>
  <span>Unmute</span>`;
  document.querySelector(".main__mute__button").innerHTML = html;
};

const playStop = () => {
  let enabled = myvideoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    myvideoStream.getVideoTracks()[0].enabled = false;
    setPlayVideo();
  } else {
    setStopVideo();
    myvideoStream.getVideoTracks()[0].enabled = true;
  }
};

const setStopVideo = () => {
  const html = `<i class="fas fa-video"></i>
              <span>Stop Video</span>`;
  document.querySelector(".main__video__button").innerHTML = html;
};

const setPlayVideo = () => {
  const html = `<i class="stop fas fa-video-slash"></i>
                <span>Play Video</span>`;
  document.querySelector(".main__video__button").innerHTML = html;
};

const scrollToBottom = () => {
  let d = $(".main__chat__window");
  d.scrollTop(d.prop("scrollHeight"));
};


function addIdToMyVideo(video, h1, name) {
  // console.log("Adding id",name,video)
  var id = document.createAttribute("id");
  id.value = name;
  video.setAttributeNode(id);
  // var h1=document.createElement('h1');
  h1.innerHTML = name;
  video.parentNode.insertBefore(h1, video.nextSibling);
}



var addOtherVideoStream = function(videoDiv,video,h1, stream,peerId) {
    // console.log("Yehi chaiye pklease dedo",peerId)
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', function() {
        video.play();
    })
    var videoId=document.createAttribute('id');
    videoId.value=peerId;
    video.setAttributeNode(videoId);
    videoDiv.append(video);
    videoGrid.append(videoDiv);
    h1.innerHTML=peerId;
    video.parentNode.insertBefore(h1, video.nextSibling);
  }

  
