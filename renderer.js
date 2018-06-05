var clientData = [{
    'user': 'monika',
    'status': 'online'
},
{
    'user': 'neha',
    'status': 'online'
},
{
    'user': 'namrata',
    'status': 'offline'
}, {
    'user': 'abhishek',
    'status': 'online'
}]
var userList = document.getElementById('userlist');

function updateUI(domElement, list) {
    userList.innerHTML = ' ';
    list.forEach(function (e) {
        var innerNode = document.createElement('li');
        var txtNode = document.createTextNode(e.user);
        innerNode.appendChild(txtNode);
        userList.appendChild(innerNode);
    });

}
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
// testing update ui method
updateUI(userList, clientData)
updateUI(userList, clientData)

// testing clientdata update via updateListmethod
clientData = updateList({ 'user': 'monika', 'status': 'online' }, clientData)
console.log('new list 1======', clientData);
clientData = updateList({ 'user': 'monika1', 'status': 'online' }, clientData)
console.log('new list 2======', clientData);
