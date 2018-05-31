var socket_server= require('ws').Server;
var s= new socket_server({port:8080});


s.on('connection',function(ws){
    ws.on('message',function(msg){
        msg=JSON.parse(msg);
        console.log(msg);
        //if the request is made to send name of the client then execute this
        if(msg.type == 'name'){
            //associating a new property with ws , so that every client can have a name identifier
            ws['personName']=msg.name;
            // console.log(ws);
            return;
        }
        console.log('received: '+msg);
        // ws.send('<span class="msg-label">Server: </span>'+msg);
        s.clients.forEach(function e(client){
            if(client!=ws){
                client.send(JSON.stringify({
                    name: ws.personName,
                    data: msg.data                    
                }));
            }
        });
    });
    ws.on('close',function(msg){
        console.log('oops!!! client lost');
    });
    console.log('client connected');
});