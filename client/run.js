const remote = require('./remote');

let remoteIp = process.env.REMOTE_IP;
remoteIp = remoteIp.slice(1, -1);
remoteIp = remoteIp.split(",");

return Promise.all(remoteIp.map((v, i) => {
  let str = "";
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_node, _path, ...argv] = process.argv;
  let param = argv.map(item => {
    return (str += `${item} `)
  });
  param = param[param.length - 1];
  logger.info("param: ", param)
  return remote(i, function (param) {
    return execFunc(param)
  }, [param])
}))
  .then((result) => new Promise(function (res) {
    result = result.toString();
    logger.debug("---------------  result  ---------------");
    logger.info(result)
    res(result);
  }))
  .catch(error => {
    logger.error("remote info error", error.stack || error.toString());
    process.exit(0)
  });

// node run free -h
