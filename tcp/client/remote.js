const Logger = require('beauty-logger');
const path = require('path');
const net = require('net');
const crypt = require('../../common/crypt');

// eslint-disable-next-line new-cap
const tcpClient = net.Socket();

const logger = new Logger({
  logFileSize: 1024 * 1024 * 10,
  logFilePath: path.join(__dirname, './client.log'),
});

global.logger = logger;

require('../../common/setenv');

const remote = function (i, f, params, ...args) {
  if (!(params instanceof Array) || args.length) {
    arguments.length > 1 && args.unshift(params);
  } else {
    args = params;
  }
  params = JSON.stringify(
    args,
    function (p, o) {
      for (const k in o) {
        if (Object.prototype.hasOwnProperty.call(o, k)) {
          const v = o[k];
          o[k] = v instanceof Function ? v() : v;
        }
      }
      return o;
    },
    4,
  );

  const port = process.env.SERVER_PORT; //rpc端口
  let remoteIp = process.env.REMOTE_IP;
  remoteIp = remoteIp.slice(1, -1);
  remoteIp = remoteIp.split(',');
  return new Promise(function (resolve, reject) {
    const options = {
      port,
      host: remoteIp[i],
    };
    tcpClient.connect(options, function () {
      logger.log('connecting to Server', options);
      const func = 'return ' + f.toString() + `.apply(this, ${params})`;
      tcpClient.write(crypt.encrypt(func));
    });

    tcpClient.on('end', function () {
      logger.error('connect fail!');
      reject(new Error('connect fail!'));
    });

    tcpClient.on('error', function (err) {
      logger.error('tcp_client error!');
      reject(err);
    });

    tcpClient.on('data', function (data) {
      logger.info('received data: %s from server', data.toString());
      data = String(crypt.decrypt(data));
      logger.info('on data', data);
      resolve(data);
    });
  });
};

module.exports = remote;
