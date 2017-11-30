const axios = require('axios');
const crypto = require('crypto');
const channelId = '1535979058';
const channelSecret = '0f60aa358b49edba6a87e398a99c6120';
const channelAccessToken = 'PEph1XXJHO96VvRdx7mY3ieET/GUDAEzsn9GgRJBgC+zfUprYCb2WPvV8TT25jU6Soba3N7a7U7y+YLqr8KLqhsrxsDcYQaHQPDo9d4nIE/86P/5gVF1SGkIVGNuK3yUWglDVLJ/LQI1027J8iZ4OwdB04t89/1O/w1cDnyilFU=';


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
      messages: messages
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

  console.log(ctx.request.rawBody);
  const replyToken = ctx.request.body.events[0].replyToken;
  const messages = { type: 'text', text: 'Hello World!' };
  sendReplyMessage(replyToken, messages);

  ctx.response.body = 'Hello';
};


module.exports = {
  'POST /line': fn_line
};
