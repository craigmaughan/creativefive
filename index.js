// Setup basic express server
var express = require('express');
var router = express.Router();
var app = express();
var request = require('request')
var path = require('path');
var port = process.env.PORT || 3000;

//Socket IO addon
var http = require('http').Server(app);
var io = require('socket.io')(http);

// Route to public folder
app.use(express.static(path.join(__dirname, 'public')));

//Set up listening port
http.listen(port, function () {
    console.log('Server listening at port %d', port);
});

// Socket IO variables
var chatRoom1 = io.of('/chatRoom1');
var chatRoom2 = io.of('/chatRoom2');
var chat1_numUsers = 0;
var chat2_numUsers = 0;
var chat1_users = [];
var chat2_users = [];


/*
FOR CRAIG AND JOSH
socket.on('string', function)                    --> This listens for things from the client
socket.emit('string', {key: value});             --> This send to just the one socket
socket.broadcast.emit('string', {key: value});   --> This send it to everybody


CLIENT SIDE DOCUMENTATION FOUND CLIENT SIDE
*/



chatRoom1.on('connection', function (socket) {
    console.log("chatroom1 user is connected");
    var addedUser = false;

    // when the client emits 'add user', this listens and executes
    socket.on('add user', function (username) {
        console.log("add user");

        //if this socket is already in use return
        if (addedUser) {
            return
        }

        //add socket username to array
        socket.username = username;
        chat1_users.push(username);
        ++chat1_numUsers;
        addedUser = true;

        socket.emit('login', {
            chat1_numUsers: chat1_numUsers
        });

        // echo to all clients that a person has connected
        socket.broadcast.emit('user joined', {
            username: socket.username,
            chat1_numUsers: chat1_numUsers
        });
    });

    //send active users names to requesting sockets
    socket.on('get users', function (username) {
        console.log("get user");

        var usernames = "";
        for (i = 0; i < chat1_users.length; i++) {
            usernames += chat1_users[i];

            if (i != chat1_users.length - 1) {
                usernames += ', ';
            }
        }
        usernames = "Chatters: " + usernames;

        socket.emit('get users', {
            usernames: usernames
        });
    });

    //client 'new message', this listens and executes
    socket.on('new message', function (data) {
        console.log("message: " + data + " from: " + socket.username);
        //client executes 'new message'
        socket.broadcast.emit('new message', {
            username: socket.username,
            message: data
        });
    });

    // when the user disconnects.. perform this
    socket.on('disconnect', function () {
        console.log("user disconnected called");

        //function to find and remove user name
        function remove(arr, what) {
            var found = arr.indexOf(what);

            while (found !== -1) {
                arr.splice(found, 1);
                found = arr.indexOf(what);
            }
        }
        remove(chat1_users, socket.username);

        if (addedUser) {
            --chat1_numUsers;
            // echo globally that this client has left
            socket.broadcast.emit('user left', {
                username: socket.username,
                chat1_numUsers: chat1_numUsers
            });
        }
    });
});


chatRoom2.on('connection', function (socket) {
    console.log("chat room 2 user is connected");
    var addedUser = false;

    // when the client emits 'add user', this listens and executes
    socket.on('add user', function (username) {
        console.log("add user");

        if (addedUser) {
            return
        }

        //add socket username to array
        socket.username = username;
        chat2_users.push(username);
        ++chat2_numUsers;
        addedUser = true;

        socket.emit('login', {
            chat2_numUsers: chat2_numUsers
        });

        // echo to all clients that a person has connected
        socket.broadcast.emit('user joined', {
            username: socket.username,
            chat2_numUsers: chat2_numUsers
        });
    });

    //send how users names
    socket.on('get users', function (username) {
        console.log("get user");
        console.log(chat1_users);

        var intro = "Chatters: ";
        var usernames = "";
        for (i = 0; i < chat2_users.length; i++) {
            console.log(chat2_users[i]);
            usernames += chat2_users[i]
            if (chat2_numUsers != chat2_users.length) {
                usernames += ',';
            }
        }
        usernames = intro + usernames;

        socket.emit('get users', {
            username: usernames,
        });
    });

    //client 'new message', this listens and executes
    socket.on('new message', function (data) {
        console.log("message: " + data + " from: " + socket.username);
        //client executes 'new message'
        socket.broadcast.emit('new message', {
            username: socket.username,
            message: data
        });
    });


    // when the user disconnects.. perform this
    socket.on('disconnect', function () {
        console.log("user disconnected called");

        function remove(arr, what) {
            var found = arr.indexOf(what);

            while (found !== -1) {
                arr.splice(found, 1);
                found = arr.indexOf(what);
            }
        }
        remove(chat2_users, socket.username);

        if (addedUser) {
            console.log(chat2_numUsers);
            --chat2_numUsers;
            console.log(chat2_numUsers);


            // echo globally that this client has left
            socket.broadcast.emit('user left', {
                username: socket.username,
                chat2_numUsers: chat2_numUsers
            });
        }
    });
});
