var socket=new WebSocket('ws://localhost:8080');

var msgDiv=document.getElementById('_message');
var editorNode=document.getElementById('_text');
var name= prompt('please ener your name');
socket.onopen=function(){
    socket.send(JSON.stringify({
        type:'name',
        name:name
    }));
}
socket.onmessage=function(message){
    console.log(message);   
    var jsonData=JSON.parse(message.data);
    console.log(message.data); 
    msgDiv.innerHTML += '<div><span class="msg-label green"> '+jsonData.name+' </span> '+ jsonData.data + '</div>';
    editorNode.innerHTML = ' ';
}
var sendBtn=document.querySelector('button');
sendBtn.onclick=function(){   
    var text=editorNode.value;
    // socket.send(text);
    socket.send(JSON.stringify({
        type:'message',
        data:text
    }));
    msgDiv.innerHTML += '<div> <span class="msg-label">You:</span> '+ text + '</div>';
    editorNode.innerHTML = ' ';
    
}