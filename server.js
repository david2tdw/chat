const express = require('express')
const app = express()

const server = require('http').Server(app)

const io = require('socket.io')(server)

let users = []
let usersInfo = []

app.use('/', express.static(__dirname + '/static'))

// 每个连接的用户都有专有的socket
/* 
   io.emit(foo); //会触发所有用户的foo事件
   socket.emit(foo); //只触发当前用户的foo事件
   socket.broadcast.emit(foo); //触发除了当前用户的其他用户的foo事件
*/

io.on('connection', (socket) => {
  // 渲染在线人员
  io.emit('disUser', usersInfo)

  // 登录，检测用户名
  socket.on('login', (user) => {
    console.log('login....')
    if (users.indexOf(user.name) > -1) {
      socket.emit('loginError')
    } else {
      users.push(user.name)
      usersInfo.push(user)
      // 登录成功，隐藏登录层
      socket.emit('loginSuc')
      socket.nickname = user.name
      // 系统提示消息
      io.emit('system', {
        name: user.name,
        status: '进入',
      })
      // 显示在线人员
      io.emit('disUser', usersInfo)
      console.log(users.length + 'user connect.')
    }
  })

  // 发送窗口抖动
  socket.on('shake', () => {
    socket.emit('shake', {
      name: '您'
    })
    socket.broadcast.emit('shake', {
      name: socket.nickname
    })
  })

  // 发送消息事件
  socket.on('sendMsg', (data) => {
    let img = ''
    for (let i = 0; i < usersInfo.length; i++) {
      if (usersInfo[i].name === socket.nickname) {
        img = usersInfo[i].img
      }
    }
    socket.broadcast.emit('receiveMsg', {
      name: socket.nickname,
      img: img,
      msg: data.msg,
      color: data.color,
      type: data.type,
      side: 'left', // 信息显示在哪一侧
    })
    socket.emit('receiveMsg', {
      name: socket.nickname,
      img: img,
      msg: data.msg,
      color: data.color,
      type: data.type,
      side: 'right',
    })
  })

  // 断开连接时
  socket.on('disconnect', () => {
    let index = users.indexOf(socket.nickname)
    if (index > -1) {
      users.splice(index, 1)
      usersInfo.splice(index, 1)
      // 系统通知
      io.emit('system', {
        name: socket.nickname,
        status: '离开',
      })
      // 重新渲染
      io.emit('disUser', usersInfo)
    }
  })
})

server.listen(3000, function () {
  console.log('pls access the url: http://localhost:3000/')
  console.log('listen 3000 port.')
})
