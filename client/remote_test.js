let remote = require('./remote');
let remoteIp = process.env.REMOTE_IP;
remoteIp = remoteIp.slice(1,-1);
remoteIp = remoteIp.split(",");

return Promise.all(remoteIp.map((v, i) => {
        let str = "";
        const [node, path, ...argv] = process.argv;
        let param = argv.map(item=>{
            return (str += `${item} `)
        });
        param = param[param.length - 1];
        console.info("param: ", param)
        return remote(i, function (param) {
            return execFunc(param)
        },[param])
    }))
    .then((result) => new Promise(function (res, rej) {
        result = result.toString();
        console.debug("---------------  result  ---------------");
        console.log("result", result)
        res(result);
    }))
    .catch(error => {
        logger.error("remote info error", error.stack || error.toString());
        process.exit(0)
    });

// return Promise.all(remoteIp.map((v, i) => {
//     return remote(i, function () {
//         return checkState()
//     })
// }))
// .then((result) => new Promise(function (res, rej) {
//     logger.debug("remote info2", result);
//     res(result);
// }))
// .catch(error => {
//     logger.error("remote info error", error);
//     process.exit(0)
// });