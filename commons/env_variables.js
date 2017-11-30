const fs = require('fs');

let getEnv = function(key) {
  if (key.indexOf('=') > -1) {
    throw Error('key contains =, remote it from key name');
  }
  let result = undefined;
  const path = '.env';
  if (fs.existsSync(path)) {
    fs.readFileSync(path).toString().split('\n').forEach(function (line) { 
      const re = new RegExp('^\s*' + key + '\s*=\s*(.*)\s*' , "g");
      if (re.test(line)) {
        const i = line.indexOf('=');
        result = line.substr(i + 1).trim();
      }
    });
  } else {
    result = process.env[key];
  }
  return result;
};

module.exports = getEnv;