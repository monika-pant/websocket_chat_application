var socket_server= require('ws').Server;
var s= new socket_server({port:8080});
var presenceCounter=0;
var clientNames=[];


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