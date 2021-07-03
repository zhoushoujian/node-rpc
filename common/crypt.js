/* eslint-disable camelcase */
/* eslint-disable no-bitwise */
const defaultSign = 'put your text here';
const crypt = function (data, sign = defaultSign) {
  const buff = Buffer.from(data);
  const ssrc = Buffer.concat([Buffer.from(sign), Buffer.from(sign && sign.length + '')]);
  let next = ssrc[0];
  for (let cx = 0, dx = buff.length; cx < dx; cx++) {
    // eslint-disable-next-line no-bitwise
    buff[cx] = buff[cx] ^ next; //^异或运算符
    next = ssrc[(next + cx) % ssrc.length]; //动态更改key
  }
  return buff;
};

const encode = crypt;
const decode = crypt;

//有时效限制的加密解密算法，服务器时间要和客户机时间同步
crypt.timevalid = 120000;
crypt.encrypt = function (data, sign = defaultSign) {
  let timevalid = crypt.timevalid;
  const time = Date.now() - timevalid;
  timevalid <<= 1;
  const remainder = (time % timevalid).toString(24);
  const consult = parseInt(time / timevalid).toString(24);
  sign = Buffer.concat([Buffer.from(consult), Buffer.from(sign)]); //每两分钟变化一次
  const time_signed = encode(consult, sign);
  return Buffer.concat([Buffer.from(remainder.length + remainder), time_signed, encode(data, sign)]);
};
crypt.decrypt = function (buff, sign = defaultSign) {
  let timevalid = crypt.timevalid;
  const time = Date.now();
  timevalid <<= 1;
  const size = parseInt(String(buff.slice(0, 1)));
  const time_start = size + 1;
  const remainder = String(buff.slice(1, time_start));
  const consult = parseInt((time - parseInt(remainder, 24)) / timevalid).toString(24);
  const data_start = time_start + consult.length;
  const time_signed = buff.slice(time_start, data_start);
  sign = Buffer.concat([Buffer.from(consult), Buffer.from(sign)]);
  if (Buffer.compare(encode(consult, sign), time_signed)) {
    //如果加密前后的数据不相同，就抛出错误
    console.warn('timeout!');
    return;
  }
  //加密前的数据和相同的sign，完美实现解密
  return decode(buff.slice(data_start), sign);
};

module.exports = crypt;
