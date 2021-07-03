const os = require('os');
const path = require('path');
const http = require('http');
const Logger = require('beauty-logger');

const logger = new Logger({
  logFileSize: 1024 * 1024 * 10,
  logFilePath: path.join(__dirname, './server.log'),
  dataTypeWarn: true,
  productionModel: false,
  enableMultipleLogFile: false,
});

global.logger = logger;

const remote = require('./_remote');

//加载依赖环境
require('../../common/setenv');
require('../../common/function');

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
module.exports = handle;

//加载远程过程调用
for (const k in remote) {
  if (Object.prototype.hasOwnProperty.call(remote, k)) {
    handle['/remote/' + k] = remote[k];
  }
}

const server = http.createServer((req, res) => {
  const url = req.url;
  if (handle[url]) {
    if (url.slice(1, 7).toLowerCase() === 'remote') {
      return handle[url](req, res);
    }
  }
  res.end('illegal request!');
});

process.on('SIGTERM', function () {
  //仅对linux生效
  logger.info('本程序运行了(秒)', process.uptime());
  process.exit(0);
});

logger.info('process.pid', process.pid);

server.listen({
  port: process.env.SERVER_PORT,
  exclusive: true, //独占一个进程
});
server.on('listening', function () {
  //logger.info('启动服务成功！');
  logger.info(`正在监听(http://${handle['/local/ip']()}:${process.env.SERVER_PORT})`);
});
//捕获异常
process.on('uncaughtException', function (err) {
  if (err === 'Error: kill ESRCH') {
    logger.error('Error: kill ESRCH 子进程已退出');
  } else {
    logger.warn('Caught exception: ' + err);
  }
});
