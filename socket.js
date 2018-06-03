var socket=new WebSocket('ws://localhost:8080');

var msgDiv=document.getElementById('_message');
var editorNode=document.getElementById('_text');
var name='';
var clients=[];

var totUser=document.getElementById('userCounter');
var userList=document.getElementById('userlist');
var welcomeMsg=document.getElementById('welcomeMsg');
var clientList=0;

socket.onopen=function(message){  
    clientList++; 
    clients.push({'socket':socket,'name':name}); 
    
    name= prompt('please ener your name');   
    console.log('i came from socket open',message);
    // console.log('total users connected',clientList)
    // console.log(totUser);
      
    socket.send(JSON.stringify({
        type:'name',
        name:name
    }));
}
socket.onclose=function(message){
    console.log(message);
    
    
}
socket.onmessage=function(message){
    // console.log('message received from server',message);  
    
    var jsonData=JSON.parse(message.data);
    console.log('data as message from server',jsonData);
    clients.push({'name':jsonData.name,'presence':jsonData.presence});
    // console.log('my clients ist',clients); 
    if(jsonData.type=='message')
    {
        msgDiv.innerHTML += '<div><span class="msg-label green"> '+jsonData.name+'&nbsp;'+jsonData.presence +' </span> '+ jsonData.data + '</div>';
        editorNode.innerHTML = ' ';
    }
    else if(jsonData.type== 'notify'){
        clients.forEach(function(e){
            totUser.innerHTML='Total Users Connected : '+jsonData.users; 
            // welcomeMsg.innerHTML='welcome '+jsonData.name;
            // userList.innerHTML='<li>'+ e.name+ '&nbsp;<span class="green">'+ e.presence+'</span></li>'
        })
        
    }
    else if(jsonData.type== 'open'){
        clients.forEach(function(e){
            totUser.innerHTML='Total Users Connected : '+jsonData.users; 
            welcomeMsg.innerHTML='welcome '+jsonData.name;
            // userList.innerHTML='<li>'+ e.name+ '&nbsp;<span class="green">'+ e.presence+'</span></li>'
        })
        
    }
    else if(jsonData.type== 'close'){
        totUser.innerHTML='Total Users Connected : '+jsonData.users;
        msgDiv.innerHTML += '<div><span class="msg-label red"> '+jsonData.name+'&nbsp;'+jsonData.presence +' </span></div>';
        editorNode.innerHTML = ' ';
    }
    
}
var sendBtn=document.querySelector('button');
sendBtn.onclick=function(){   
    var text=editorNode.value;
    // socket.send(text);
    socket.send(JSON.stringify({
        type:'message',
        data:text
    }));
    msgDiv.innerHTML += '<div> <span class="msg-label green">You:</span> '+ text + '</div>';
    editorNode.innerHTML = ' ';
    
}