const axios = require('axios');
const env = require('./env_variables');
const appId = env('UNSPLASH_APPLICATION_ID');

let random = async function(key) {
  let url = 'https://api.unsplash.com/photos/random';
  if (key) {
    url += '?query=' + key;
  }
  return await axios({
      method: 'get',
      url: url,
      headers: {
        'Authorization': 'Client-ID ' + appId
      }    
    });
};


module.exports = random;