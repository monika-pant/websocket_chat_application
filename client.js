var socket = new WebSocket('ws://localhost:8080');

//dom elements declaraations
var userList = document.getElementById('userlist');
var msgDiv = document.getElementById('_message');
var editorNode = document.getElementById('_text');
var callBtn = document.getElementById('makeCall');
//client details array for connected users
var clientData = [];


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
        clientData = jsonData.clientlist;
        updateUI(userList, clientData, jsonData.currentUser)
    }
    else if (jsonData.type == 'open') {

    }
    else if (jsonData.type == 'close') {
        console.log(jsonData)
        clientData = jsonData.clientlist;
        updateUI(userList, clientData, jsonData.currentUser)
        printMsg(jsonData, msgDiv, editorNode);
    }

}
var sendBtn = document.querySelector('button');
sendBtn.onclick = function () {
    var text = editorNode.value;
    socket.send(JSON.stringify({
        type: 'message',
        data: text
    }));
    msgDiv.innerHTML += '<div> <span class="msg-label green">You:</span> ' + text + '</div>';
    editorNode.innerHTML = ' ';
}






function updateUI(domElement, list, userName) {
    userList.innerHTML = ' ';
    
    console.log('=======',list)
    callBtn.style.display = 'block';
    list.forEach(function (e) {
        var Myuser = e.user;
        var presenceClass = 'red'
        var checkClass= 'activate'



        console.log(e.status)
        if (e.status == 'online')
            presenceClass = 'green'
        if(e.status== 'offline')
            checkClass='deactivate'
        // if(e.user==userName)
        // Myuser='You';

        userList.innerHTML += '<li class='+checkClass +'> <input type="checkbox" >' + e.user + '&nbsp;<label class=' + presenceClass + '>' + e.status + '</label></li>'
    });

}
function printMsg(message, msgDiv, editorNode) {
    switch (message.type) {
        case 'close':
            msgDiv.innerHTML += '<div><span class="msg-label red"> ' + message.name + '&nbsp; got disconnected</span></div>';
            editorNode.innerHTML = ' ';
            break;

        default:
            msgDiv.innerHTML += '<div><span class="msg-label green"> ' + message.name + '&nbsp; </span> ' + message.data + '</div>';
            editorNode.text = ' ';
            break;
    }

}
