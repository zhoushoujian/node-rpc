const Logger = require('beauty-logger');
const http = require('http');
const path = require('path');

const logger = new Logger({
  logFileSize: 1024 * 1024 * 10,
  logFilePath: path.join(__dirname, './client.log'),
  dataTypeWarn: true,
  productionModel: false,
  enableMultipleLogFile: false,
  enableParallelPrint: true,
});

global.logger = logger;

const crypt = require('../../common/crypt');
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
  const path = '/remote/exec';
  const port = process.env.SERVER_PORT; //rpc端口
  let remoteIp = process.env.REMOTE_IP;
  remoteIp = remoteIp.slice(1, -1);
  remoteIp = remoteIp.split(',');
  const options = {
    path,
    port,
    hostname: remoteIp[i],
    method: 'POST',
  };
  return new Promise(function (resolve, reject) {
    const req = http.request(options, function (res) {
      const chunks = [];
      res.on('data', function (data) {
        chunks.push(data);
      });
      res.on('end', function () {
        let data;
        if (res.statusCode !== 200) {
          data = String(crypt.decrypt(Buffer.concat(chunks), 'A error happened'));
          logger.warn(func);
          // eslint-disable-next-line prefer-promise-reject-errors
          return reject('oh error ' + res.statusCode + ':' + data);
        }
        data = String(crypt.decrypt(Buffer.concat(chunks), 'one more kiss that is no crazy'));
        return resolve(JSON.parse(data));
      });
    });
    req.on('error', reject);
    const func = 'return ' + f.toString() + `.apply(this,${params})`;
    // eslint-disable-next-line no-useless-escape
    req.write(crypt.encrypt(func, "it's raining outside and I do miss you"));
    req.end();
  });
};

module.exports = remote;
