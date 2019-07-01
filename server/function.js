'use strict';
let os=require("os"),
    exec=require("child_process").exec;

function checkState(){
    let arrayList = [],
        address,
        networks = os.networkInterfaces();
    Object.keys(networks).forEach(function (k) {
        for (var kk in networks[k]) {
            if (networks[k][kk].family === "IPv4" && networks[k][kk].address !== "127.0.0.1") {
                address = networks[k][kk].address;
                return address;
            }
        }
    });
    return new Promise(function(res,rej){
        if(process.platform === "win32"){
            let child = exec("win_info.bat");
            child.stdout.on('data',function(data){
                logger.debug("win_info stdout",data.replace(/[\r\n]/g,"  "));
                arrayList.push(data);
            });
            child.stderr.on("data",function(data){
                if(data) rej(data);
                logger.warn("win_info stderr",data);
            });
            child.on('exit',function(code){
                logger.warn("win_info exit,code",code);
                setTimeout(function(){
                    logger.info("IP",address,"info",arrayList.join("").replace(/[\r\n]/g," ").split(","))
                    res(["IP",address,"info",arrayList.join("").replace(/[\r\n]/g," => ").split(",")])
                });
            });
        } else if (process.platform === "linux"){
            let child = exec(`bash linux_cpu.sh`);
            child.stdout.on('data',function(data){
                logger.debug("linux_info stdout",data.replace(/[\r\r\n]/g," => ").split(",")[0].slice(0, -3));
                arrayList.push(data);
            });
            child.stderr.on("data",function(data){
                logger.warn("linux_info stderr",data);
                if(data) rej(data);
            });
            child.on('exit',function(code){
                logger.warn("linux_info exit,code",code);
                setTimeout(function(){
                    logger.info("IP",address,"info",arrayList.join("").replace(/[\r\r\n]/g," ").split(","));
                    res(["IP",address,"info",arrayList.join("").replace(/[\r\r\n]/g," => ").split(",")]);
                });
            });
        } else if (process.platform === "darwin"){
            let child = exec(`lsof -i tcp:1997`);
            child.stdout.on('data',function(data){
                logger.debug("mac_info stdout",data.replace(/[\r\r\n]/g," => ").split(",")[0].slice(0, -3));
                arrayList.push(data);
            });
            child.stderr.on("data",function(data){
                logger.warn("mac_info stderr",data);
                if(data) rej(data);
            });
            child.on('exit',function(code){
                logger.warn("mac_info exit,code",code);
                setTimeout(function(){
                    logger.info("IP",address,"info",arrayList.join("").replace(/[\r\r\n]/g," ").split(","));
                    res(["IP",address,"info",arrayList.join("").replace(/[\r\r\n]/g," => ").split(",")]);
                });
            });
        }
    })
}

function execFunc(command){
    let arrayList = [];
    if(!command){
        return Promise.resolve("no allow send empty command")
    }
    return new Promise(res => {
        let child = exec(command);
        child.stdout.on('data',function(data){
            logger.debug("stdout",data.replace(/[\r\r\n]/g," => ").split(",")[0].slice(0, -4));
            arrayList.push(data);
        });
        child.stderr.on("data",function(data){
            logger.warn("stderr",data);
            if(data) res(data);
        });
        child.on('exit',function(code){
            logger.warn("linux_info exit,code",code);
            res(arrayList);
        });
    })
}

module.exports = {
    checkState,
    execFunc
}