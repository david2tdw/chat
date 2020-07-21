$(function () {
  // io-client
  // 连接成功会触发服务器端的connection事件
  const socket = io()

  // 点击输入昵称，回车登录
  $('#name').keyup(ev => {
    console.log(ev.which === 13)
    if (ev.which === 13) { // ev.which 是数字
      inputName()
    }
  })

  function inputName () {
    let imgN = Math.floor(Math.random() * 4) + 1 // 随机分配头像
    console.log('inputName:' + $('#name').val().trim())
    if ($('#name').val().trim() !== '') {
      
      socket.emit('login', {
        name: $('#name').val(),
        img: 'image/user' + imgN + '.jpg'
      })
    }
    return false
  }

  $('#nameBtn').click(inputName)

  // 登录成功，隐藏登录层
  socket.on('loginSuc', () => {
    $('.name').hide()
  })

  socket.on('loginError', () => {
    alert('用户名已存在，请重新输入！')
    $('#name').val()
  })

  // 系统提示消息
  socket.on('system', (user) => {
    console.log('system')
    let data = new Date().toTimeString().substr(0,8)
    $('#messages').append(`<p class="system"><span>${data}</span><br /><span>${user.name} ${user.status}了聊天室</span></p>`)
    // 滚动条总是在最底部
    $('#messages').scrollTop($('#messages')[0].scrollHeight)
  })
  
  // 显示在线人员
  socket.on('disUser', (usersInfo) => {
    displayUser(usersInfo)
  })

  // 显示在线人员
  function displayUser(users) {
    $('#users').text('')
    if (!users.length) {
      $('.contacts p').show()
    } else  {
      $('.contacts p').hide()
    }
    $('#num').text(users.length)

    for (let i = 0; i < users.length; i++) {
      let $html =  `<li>
        <img src="${users[i].img}">
        <span>${users[i].name}</span>
      </li>`
      $('#users').append($html)
    }
  }

  // 发送消息
  $('#sub').click(sendMsg)
  $('#messageBox').keyup(ev => {
    if (ev.which === 13) {
      sendMsg()
    }
  })

  // 发送消息
  let color = '#000000'
  function sendMsg () {
    if ($('#messageBox').val() === '') {
      alert('请输入内容！')
      return false
    }

    color = $('#color').val()
    socket.emit('sendMsg', {
      msg: $('#messageBox').val(),
      color: color,
      type: 'text'
    })
    $('#messageBox').val('')
    return false
  }

  // 接收消息
  socket.on('receiveMsg', obj => {
    console.log(obj)
    // 发送为图片
    if (obj.type === 'img') {
      $('#messages').append(`
        <li class="${obj.side}">
          <img src="${obj.img}" />
          <div>
            <span>${obj.name}</span>
            <p style="padding: 0;">${obj.msg}</p>
          </div>
        </li>
      `)
      // 解决图片渲染器高度获取错误的情况（滚动条不滚动）
      setTimeout(function () {
        $('#messages').scrollTop($('#messages')[0].scrollHeight)
      }, 500)
      
      return
    }
    // 提取文字中的表情加以渲染
    let msg = obj.msg
    let content = ''

    while (msg.indexOf('[') > -1) {
      let start = msg.indexOf('[')
      let end = msg.indexOf(']')

      content += `<span>${msg.substr(0, start)}</span>`
      content += `<img src="image/emoji/emoji%20(${msg.substr(start + 6, end - start - 6)}).png" />`
      msg = msg.substr(end + 1, msg.length) // 每个表情后面剩余的内容
    }
    content += `<span>${msg}</span>`

    $('#messages').append(`
      <li class="${obj.side}">
        <img src="${obj.img}">
        <div>
          <span>${obj.name}</span>
          <p style="color: ${obj.color};">${content}</p>
        </div>
      </li>
    `)
    // 滚动条总是在最底部
    $('#messages').scrollTop($('#messages')[0].scrollHeight)
  })

  // 关闭 清空历史消息
  $('#clear').click(() => {
    $('#messages').text('')
    socket.emit('disconnect')
  })

  // 渲染表情
  init()

  function init () {
    for (let i = 0; i < 141; i++) {
      $('.emoji').append(`<li id=${i}><img src="image/emoji/emoji (${i + 1}).png"/></li>`)
    }
  }
  // 显示表情
  $('#smile').click(() => {
    $('.selectBox').css('display', 'block')
  })
  $('#smile').dblclick(ev => {
    $('.selectBox').css('display', 'none')
  })
  $('#m').click(() => {
    $('.selectBox').css('display', 'none')
  })

  // 用户点击发送表情
  $('.emoji li img').click(ev => {
    ev = ev || window.event
    let src = ev.target.src
    let emoji = src.replace(/\D*/g, '').substr(6,8)
    let old = $('#messageBox').val()
    $('#messageBox').val(old + '[emoji'+emoji+']')
    $('.selectBox').css('display', 'none')
  })

  // 用户发送抖动
  $('.edit #shake').click(function () {
    socket.emit('shake')
  })

  // 监听抖动事件
  socket.on('shake', user => {
    let data = new Date().toDateString().substr(0,8)
    $('#messages').append(`<p class="system"><span>${data}</span><br /><span>${user.name}发送了一个窗口抖动</span></p>`)
    shakeWindow()
    // 滚动条总是在最底部
    $('#messages').scrollTop($('#messages')[0].scrollHeight)
  })

  let timer
  function shakeWindow () {
    $('.main').addClass('shaking')
    clearTimeout(timer)
    timer = setTimeout(() => {
      $('.main').removeClass('shaking')
    }, 500)
  }

  // 用户发送图片
  $('#file').change(function () {
    let file = this.files[0] // 上传单张图片
    let reader = new FileReader()

    // 文件读取出错的时候触发
    reader.onerror = function () {
      console.log('读取文件失败，请重试！')
    }
    // 读取成功后
    reader.onload = function () {
      let src = reader.result // 读取结果
      let img = `<img class="sendImg" src="${src}"/>`
      socket.emit('sendMsg', {
        msg: img,
        color: color,
        type: 'img'
      })
    }
    reader.readAsDataURL(file) // 读取为64位
  })
})
