var socket_server= require('ws');


var http = require('http');
var path = require('path');
var fs = require('fs');
var presenceCounter=0;
var clientNames=[];//not using yet



//http server for serving static files
var server= new http.createServer(function(request,response){
    var filePath = '.' + request.url;
    if (filePath == './')
        filePath = './index.html';
    
    var extname = path.extname(filePath);//check file extension
    // console.log(filepath);
    // console.log(extname);
    var contentType = 'text/html';
    fs.readFile(filePath, function(error, content) {
        if (error) {
            if(error.code == 'ENOENT'){
                fs.readFile('./404.html', function(error, content) {
                    response.writeHead(200, { 'Content-Type': contentType });
                    response.end(content, 'utf-8');
                });
            }
            else {
                response.writeHead(500);
                response.end('Sorry, check with the site admin for error: '+error.code+' ..\n');
                response.end(); 
            }
        }
        else {
            response.writeHead(200, { 'Content-Type': contentType });
            response.end(content, 'utf-8');
        }
    });

});
// my static http server code ends here





// socket server code below
var s= new socket_server.Server({server});
s.on('connection',function(ws){
    presenceCounter++;
    s.clients.forEach(function(client){  
        var conOpendata;            
        ws.on('message',function(data){
                       
            conOpendata=JSON.parse(data);           
            if(client!= ws){
                console.log('data type from client',conOpendata) 
                if(conOpendata.type=='name'){
                    client.send(JSON.stringify({
                        users: presenceCounter,
                        presence: "online"  ,
                        type:'notify',
                        // name:conOpendata.name  ,
                        list:clientNames
                    })); 
                }
                                         
            } 
            else{
                if(conOpendata.type=='name'){
                    client.send(JSON.stringify({
                        users: presenceCounter,
                        presence: "online"  ,
                        type:'open',
                        name:conOpendata.name  ,
                        list:clientNames
                    }));
                }
                  
            } 
            console.log('what from client',conOpendata)  
                            
        });                           
    });    

    //cient server interaction via message
    ws.on('message',function(msg){
        msg=JSON.parse(msg);
        console.log('msg from client',msg)
              
        //if the request is made to send name of the client then execute this
        if(msg.type == 'name'){
            //associating a new property with ws , so that every client can have a name identifier
            ws['personName']=msg.name;            
            return;
        }
        s.clients.forEach(function e(client){
            if(client!=ws){
                client.send(JSON.stringify({
                    name: ws.personName,
                    data: msg.data  ,
                    totalUsers:presenceCounter  ,
                    type:'message',
                    presence:'online'              
                }));
            }
           
        });        
    });
    ws.on('close',function(con){
        presenceCounter--;
        s.clients.forEach(function(client){
                client.send(JSON.stringify({
                    name: ws.personName,
                    presence: "offline" ,
                    type:'close',
                    users:presenceCounter                   
                }));
                return;           
        });                 
    });
    // console.log('client connected');   
    
});

//listening http server
server.listen(8080);