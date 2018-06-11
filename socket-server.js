var socket_server = require('ws');


var http = require('http');
var path = require('path');
var fs = require('fs');
var presenceCounter = 0;
var clientNames = [];//not using yet



//http server for serving static files
var server = new http.createServer(function (request, response) {
    var filePath = '.' + request.url;
    if (filePath == './')
        filePath = './index.html';

    var extname = path.extname(filePath);//check file extension
    // console.log(filepath);
    // console.log(extname);
    var contentType = 'text/html';
    fs.readFile(filePath, function (error, content) {
        if (error) {
            if (error.code == 'ENOENT') {
                fs.readFile('./404.html', function (error, content) {
                    response.writeHead(200, { 'Content-Type': contentType });
                    response.end(content, 'utf-8');
                });
            }
            else {
                response.writeHead(500);
                response.end('Sorry, check with the site admin for error: ' + error.code + ' ..\n');
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
var s = new socket_server.Server({ server });
s.on('connection', function (ws) {
    presenceCounter++;
    ws.on('open', function () {
        console.log('connection open');
    })
    //cient server interaction via message
    ws.on('message', function (msg) {
        msg = JSON.parse(msg);
        console.log('msg from client', msg)

        //if the request is made to send name of the client then execute this
        switch (msg.type) {
            case 'register':
                clientDataList = updateList({ 'user': msg.name, 'status': 'online' }, clientDataList);
                // console.log('list of online users',clientDataList); 
                ws.personName = msg.name;
                s.clients.forEach(function e(client) {
                    // if(client!=ws){
                    client.send(JSON.stringify({
                        clientlist: clientDataList,
                        type: 'notify',
                        currentUser:ws.personName
                    }));
                    // }

                });
                break;
            case 'message':
                s.clients.forEach(function e(client) {
                    if (client != ws) {
                        client.send(JSON.stringify({
                            name: ws.personName,
                            data: msg.data,
                            type: 'message'
                        }));
                    }

                });
                break;
            case 'call':
            // console.log('call msg====================',msg);
            // console.log('call person name============',ws.personName);
            s.clients.forEach(function e(client) {
                //  console.log('client is here',client.personName);
                 console.log(msg)
                if (client.personName == msg.receiver) {
                    // console.log('inside if')
                    let data=JSON.stringify({
                        sender: ws.personName,
                        data: 'handshaking with user',
                        type: 'call'
                    });
                    client.send(data);
                    
                }

            });
                break;
            case 'sdp-reques':
            console.log('call msg====================',msg);
            default:
                break;
        }


    });
    ws.on('close', function (con) {
        // presenceCounter--;
        clientDataList = updateList({ 'user': ws.personName, 'status': 'offline' }, clientDataList);
        s.clients.forEach(function (client) {
            client.send(JSON.stringify({
                clientlist: clientDataList,
                name: ws.personName,
                status: "offline",
                type: 'close'
            }));
            return;
        });
    });
    // console.log('client connected');   

});

//listening http server
server.listen(8080);



//renderrer functions
var clientDataList = [];
function updateList(newEntry, list) {
    let updateFlag = false;
    list.forEach(function (e) {
        if (e.user == newEntry.user) {
            e.status = newEntry.status;
            updateFlag = true;
        }
    })
    if (!updateFlag) {
        list.push(newEntry);
    }
    return list;
}