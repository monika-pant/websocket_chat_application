var socket = new WebSocket('ws://localhost:8080');

//dom elements declaraations
var userList = document.getElementById('userlist');
var msgDiv = document.getElementById('_message');
var editorNode = document.getElementById('_text');
var callBtn=document.getElementById('makeCall');
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
        updateUI(userList, clientData,jsonData.currentUser)
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






function updateUI(domElement, list,userName) {
    userList.innerHTML = ' ';
    var presenceClass = 'red'
    console.log(list)
    callBtn.style.display='block';
    list.forEach(function (e) {
        // var innerNode = document.createElement('li');
        // var statusLabel = document.createElement('label')
        // var txtNode = document.createTextNode(e.user);
        // innerNode.appendChild(txtNode);
        // innerNode.appendChild(statusLabel.appendChild(document.createTextNode('    ' + e.status)))
        // userList.appendChild(innerNode);


        //better way using innerHML
        var Myuser=e.user;
        if (e.status == 'online')
            presenceClass = 'green'
        if(e.user==userName)
            Myuser='You';
           
        userList.innerHTML += '<li> <input type="checkbox">' + Myuser + '&nbsp;<label class=' + presenceClass + '>' + e.status + '</label></li>'
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
