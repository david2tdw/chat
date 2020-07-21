运行：
```
npm install
npm start
```

访问：
http://localhost:3000/


说明：
```
io.emit(foo); //会触发所有客户端用户的foo事件
socket.emit(foo); //只触发当前客户端用户的foo事件
socket.broadcast.emit(foo); //触发除了当前客户端用户的其他用户的foo事件
```


[零基础实现node+express个性化聊天室](https://juejin.im/post/5a73ddcff265da4e81237429)