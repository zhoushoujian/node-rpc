/* eslint-disable no-loop-func */
const os = require('os');
const path = require('path');
const Logger = require('beauty-logger');
const net = require('net');

const logger = new Logger({
  logFileSize: 1024 * 1024 * 10,
  logFilePath: path.join(__dirname, './server.log'),
});

global.logger = logger;

const crypt = require('../../common/crypt');
//加载环境变量
require('../../common/setenv');
//加载函数池注册中心
require('../../common/register');

const tcpServer = net.createServer();

//获取ip地址
const handle = {
  '/local/ip': function () {
    let address;
    const networks = os.networkInterfaces();
    Object.keys(networks).forEach(function (k) {
      for (const kk in networks[k]) {
        if (networks[k][kk].family === 'IPv4' && networks[k][kk].address !== '127.0.0.1') {
          address = networks[k][kk].address;
          return address;
        }
      }
    });
    return address;
  },
};

tcpServer.listen(process.env.SERVER_PORT, function () {
  logger.info(`tcpServer 正在监听(tcp://${handle['/local/ip']()}:${process.env.SERVER_PORT})`);
});

tcpServer.on('connection', function (socket) {
  console.log(socket.address());
  return dealConnect(socket);
});

tcpServer.on('error', function () {
  logger.error('tcp_server error!');
});

tcpServer.on('close', function () {
  logger.warn('tcp_server close!');
});

function dealConnect(socket) {
  socket.on('data', async function (data) {
    try {
      logger.log('dealConnect received data: ', data.toString());
      // eslint-disable-next-line no-new-func
      const result = await new Function(String(crypt.decrypt(data))).apply(null);
      logger.info('rpc 返回给客户端的结果', result);
      return socket.write(crypt.encrypt(JSON.stringify(result)));
    } catch (err) {
      return socket.write(crypt.encrypt(err.toString()));
    }
  });

  // 客户端正常断开时执行
  socket.on('close', function () {
    logger.warn('client disconnet!');
  });
  // 客户端正异断开时执行
  socket.on('error', function (err) {
    logger.error('client error disconnet err', err);
  });
}

logger.info('process.pid', process.pid);

process.on('SIGTERM', function () {
  //仅对linux生效
  logger.info('本程序运行了(秒)', process.uptime());
  process.exit(0);
});

//捕获异常
process.on('uncaughtException', function (err) {
  if (err === 'Error: kill ESRCH') {
    logger.error('Error: kill ESRCH 子进程已退出');
  } else {
    logger.warn('Caught exception: ' + err);
  }
});
