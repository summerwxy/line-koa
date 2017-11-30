var getEnvFromFile = function(key) {
  if (key.indexOf('=') > -1) {
    throw Error('key contains =, remote it from key name');
  }
  var result = undefined;
  require('fs').readFileSync('.env').toString().split('\n').forEach(function (line) { 
    const re = new RegExp('^\s*' + key + '\s*=\s*(.*)\s*' , "g");
    if (re.test(line)) {
      const i = line.indexOf('=');
      result = line.substr(i + 1);
    }
  });
  return result;
};




module.exports = getEnvFromFile;