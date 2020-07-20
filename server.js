const express = require('express')
const app = express()

const server = require('http').Server(app)

const io = require('socket.io')(server)



let users = []
let usersInfo = []

app.use('/', express.static(__dirname + '/static'))


server.listen(3000, function () {
  console.log('listen 3000 port.')
})