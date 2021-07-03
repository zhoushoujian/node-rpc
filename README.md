# 使用 nodejs 实现的一个精简版的 rpc 框架

## 运行

`安装`

```shell
npm install
```

`server`

```shell
npm run tcp:server
```

`client`

```shell
npm run tcp:client

```

## 介绍

众所周知，rpc 支持 tcp 和 http 两种通讯协议，所以本项目使用这两种方式分别实现一个简单的 rpc 框架。由于 tcp 协议位于 OSI7 层网络模型的第四层，低于第七层的 http 协议，所以传输效率更高，也推荐大家优先了解或使用 tcp 版的 rpc

## 关于连接

需要将`common/setup.bat`里的 REMOTE_IP 改为你机器的 ip 地址，如果是局域网，写局域网内的地址就可以，如果是公网，需要填写公网的 ip  
在`common/setup.bat`里还可以修改服务端的监听的端口

## 科普

RPC（Remote Procedure Call）远程过程调用，简单的理解是一个节点请求另一个节点提供的服务

rest api 面向的是资源,而 rpc 面向的是服务

下面我找了两张图,帮助大家理解 rpc

[![rpc](rpc1.png)](rpc1.png)

[![rpc](rpc2.png)](rpc2.png)

## License

[MIT](LICENSE)
