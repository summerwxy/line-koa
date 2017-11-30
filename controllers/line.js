const axios = require('axios');
const crypto = require('crypto');
const env = require('../commons/env_variables');
const channelId = '1535979058';
const channelSecret = '0f60aa358b49edba6a87e398a99c6120';
const channelAccessToken = 'PEph1XXJHO96VvRdx7mY3ieET/GUDAEzsn9GgRJBgC+zfUprYCb2WPvV8TT25jU6Soba3N7a7U7y+YLqr8KLqhsrxsDcYQaHQPDo9d4nIE/86P/5gVF1SGkIVGNuK3yUWglDVLJ/LQI1027J8iZ4OwdB04t89/1O/w1cDnyilFU=';

var toArray = function (maybeArr) {
  return Array.isArray(maybeArr) ? maybeArr : [maybeArr];
};

var signatureValidation = function (ctx) {
  const body = ctx.request.rawBody;
  const signature = crypto.createHmac('SHA256', channelSecret).update(body).digest('base64');
  const headerSign = ctx.request.header['x-line-signature'];
  return signature === headerSign;
};

var sendReplyMessage = function (replyToken, messages) {
  console.log('to ' + replyToken);
  axios({
    method: 'post',
    url: 'https://api.line.me/v2/bot/message/reply',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + channelAccessToken
    },
    data: {
      replyToken: replyToken,
      messages: toArray(messages)
    }    
  }).then(function(response) {
    console.log('response: ');
    console.log(response);
  }).catch(function(error) {
    console.log('error: ');
    console.log(error);
  });
};


var fn_line = async (ctx, next) => {
  if (!signatureValidation(ctx)) {
    ctx.response.status = 403;
    ctx.response.body = '403 Forbidden';
    return;
  }

  // TODO: 判斷收到的消息, 回覆適當的消息
  const replyToken = ctx.request.body.events[0].replyToken;
  const messages = { type: 'text', text: 'Hello World!' };

  sendReplyMessage(replyToken, messages);

  ctx.response.body = '0_o';
};

var test = async (ctx, next) => {
  console.log(env('test'));
  console.log(process.env);
  console.log(process.env.test);
  console.log(process.env['test']);
};

module.exports = {
  'POST /line': fn_line,
  'GET /line': test
};
