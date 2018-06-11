var socket = new WebSocket('ws://localhost:8080');

//dom elements declaraations
var userList = document.getElementById('userlist');
var msgDiv = document.getElementById('_message');
var editorNode = document.getElementById('_text');
var callBtn = document.getElementById('makeCall');
//video elements
var vid1 = document.getElementById('clientvideo');
var vid2 = document.getElementById('servervdeo');
//client details array for connected users
var clientData = [];
var pc1,
    pc2,
    sdp,
    localStream;
var callFlag = false;

/**
 * socket connection code
 * @param {*} message 
 */
socket.onopen = function (message) {
    name = prompt('please ener your name');
    socket.send(JSON.stringify({
        type: 'register',
        name: name
    }));
}

socket.onmessage = function (message) {
    var jsonData = JSON.parse(message.data);

    if (jsonData.type == 'message') {
        // console.log(jsonData)  
        printMsg(jsonData, msgDiv, editorNode);
    }
    else if (jsonData.type == 'notify') {

        // testing update ui method
        // console.log(jsonData.clientlist)
        welcomeMsg.innerHTML = 'welcome ' + name;
        clientData = jsonData.clientlist;
        updateUI(userList, clientData, name)
    }
    else if (jsonData.type == 'call') {
        // console.log('call message',jsonData)
        //below alert will be a push noifiation for receiver.
        // send any ice candidates to the other peer
        if (jsonData.sdp)
        pc1.setRemoteDescription(new RTCSessionDescription(jsonData.sdp));
    else
        pc1.addIceCandidate(new RTCIceCandidate(jsonData.candidate));

        if (confirm('new message from ' + jsonData.sender)) {
            streamVideofuntion(jsonData.sender)
        };
    }
    else if (jsonData.type == 'close') {
        // console.log('close data=================',jsonData)
        clientData = jsonData.clientlist;
        updateUI(userList, clientData, name)
        printMsg(jsonData, msgDiv, editorNode);
    }
    console.log('checking for SDP=======', jsonData.type)
}
var sendBtn = document.querySelector('#sendMsg');
sendBtn.onclick = function () {
    var text = editorNode.value;
    socket.send(JSON.stringify({
        type: 'message',
        data: text
    }));
    msgDiv.innerHTML += '<div> <span class="msg-label green">You:</span> ' + text + '</div>';
    editorNode.innerHTML = ' ';
}
var callBtn = document.querySelector('#makeCall');

/**
 * calling feature
 */
callBtn.onclick = function () {
    var userOncall = '';
    callFlag = true;
    var checkboxes = document.querySelectorAll('input[type="checkbox"]:checked');
    //right now we r considering only 1-O-1 chat
    checkboxes.forEach(function (e) {
        userOncall = (e.nextSibling.data);
    }); 
      
    var sdpVal=streamVideofuntion(callFlag);
    console.log(sdpVal)
    let data = JSON.stringify({
        receiver: userOncall,
        type: 'call',
        sender: name,
        sdp:sdpVal
    })
    socket.send(data)
}




/**All FUNCTONS are written over here
 * web RTC video calling code
 */

function streamVideofuntion(flag) {
    pc1 = new RTCPeerConnection();
        pc2 = new RTCPeerConnection();
    pc1.onicecandidate = function (evt) {
        socket.send(JSON.stringify({ "candidate": evt.candidate }));
    };
    pc1.onaddstream = function (evt) {
        remoteView.srcObject = evt.stream;
    };

        


    var constraints = { audio: true, video: { width: 100, height: 140 } };
    if (navigator.mediaDevices === undefined) {
        navigator.mediaDevices = {};
    }


    if (navigator.mediaDevices.getUserMedia === undefined) {
        navigator.mediaDevices.getUserMedia = function (constraints) {

            // First get ahold of the legacy getUserMedia, if present
            var getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

            // Some browsers just don't implement it - return a rejected promise with an error
            // to keep a consistent interface
            if (!getUserMedia) {
                return Promise.reject(new Error('getUserMedia is not implemented in this browser'));
            }

            // Otherwise, wrap the call to the old navigator.getUserMedia with a Promise
            return new Promise(function (resolve, reject) {
                getUserMedia.call(navigator, constraints, resolve, reject);
            });
        }
    }
    navigator.mediaDevices.getUserMedia(constraints).then(function (localMediaStream) {
        var video = document.querySelector('#clientvideo');
        localStream=localMediaStream;

        /*************************************
            RTCPeerConnection
         ************************************/
        
        
       pc1.addStream(localStream);
        console.log('peer p1===========', pc1)
        // Older browsers may not have srcObject
        if ("srcObject" in video) {
            video.srcObject = localMediaStream;
        } else {
            // Avoid using this in new browsers, as it is going away.
            video.src = window.URL.createObjectURL(localMediaStream);
        }
        //checking if the message type is to make a call
        if (callFlag) {
        pc1.createOffer(gotDescription1)
        console.log('offer created')
        }
        else
        pc1.createAnswer(pc1.remoteDescription, gotDescription1);
        //callback function to set SDP
        function gotDescription1(desc) {
            console.log('SDP generated by browser=====', desc   )
            pc1.setLocalDescription(desc).then(function(){
                console.log('set description done')
            });
            trace("Offer from pc1 \n" + desc.sdp);
            pc2.setRemoteDescription(desc);
            pc2.createAnswer(gotDescription2);
            sdp = JSON.stringify({ 'sdp': desc, 'type': 'sdp-request' });            
        }
        })
        .catch(function (err) {
            console.log(err.name + ": " + err.message);
        });

        return(sdp);
}

function updateUI(domElement, list, userName) {
    userList.innerHTML = ' ';

    // console.log('=======', list)
    callBtn.style.display = 'block';
    list.forEach(function (e) {
        var Myuser = e.user;
        var presenceClass = 'red'
        var checkClass = 'activate'
        // console.log(e.status)
        if (e.status == 'online')
            presenceClass = 'green'
        if (e.status == 'offline')
            checkClass = 'deactivate'
        if (e.user == userName) {
            userList.innerHTML += '<li><input type="checkbox" style="visibility:hidden">You <label class=' + presenceClass + '>' + e.status + '</label></li>'
        }
        else {
            userList.innerHTML += '<li class=' + checkClass + '> <input type="checkbox" >' + e.user + '<label class=' + presenceClass + '>&nbsp;' + e.status + '</label></li>'
        }


    });

}
function printMsg(message, msgDiv, editorNode) {
    switch (message.type) {
        case 'close':
            msgDiv.innerHTML += '<div style="font-style:italic;"><span class="msg-label red"> ' + message.name + '&nbsp; got disconnected</span></div>';
            editorNode.innerHTML = ' ';
            break;

        default:
            msgDiv.innerHTML += '<div><span class="msg-label green"> ' + message.name + '&nbsp; </span> ' + message.data + '</div>';
            editorNode.text = ' ';
            break;
    }

}
