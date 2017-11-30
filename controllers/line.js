const axios = require('axios');
const crypto = require('crypto');
const env = require('../commons/env_variables');
const channelId = env('CHANNEL_ID');
const channelSecret = env('CHANNEL_SECRET');
const channelAccessToken = env('CHANNEL_ACCESS_TOKEN');
const isDev = env('IS_DEV') === 'true';

let toArray = function (maybeArr) {
  return Array.isArray(maybeArr) ? maybeArr : [maybeArr];
};

let signatureValidation = function (ctx) {
  const body = ctx.request.rawBody;
  const signature = crypto.createHmac('SHA256', channelSecret).update(body).digest('base64');
  const headerSign = ctx.request.header['x-line-signature'];
  return signature === headerSign;
};

let sendReplyMessage = function (replyToken, messages) {
  if (isDev) {
    console.log('replyToken=> ' + replyToken);
    console.log('messages=> ' + JSON.stringify(messages));
  } else {
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
      // console.log(response);
    }).catch(function(error) {
      // console.error(error);
    });
  }
};


let fn_line = async (ctx, next) => {
  if (!signatureValidation(ctx)) {
    ctx.response.status = 403;
    ctx.response.body = '403 Forbidden';
    return;
  }

  const body = ctx.request.body;
  const events = body.events;
  if (events[0].replyToken == '00000000000000000000000000000000') {
    // DO NOTHING. 驗證的時候有特殊的 replyToken
  } else if (events.length == 1 && events[0].type == 'message') {
    const event = events[0];
    const replyToken = event.replyToken;
    let messages = { };
    if (event.message.type == 'text') {
      messages = { type: 'text', text: event.message.text };
    }
    sendReplyMessage(replyToken, messages);
  } else { // TODO: finish all events
    console.log(ctx.request.rawBody); // CATCH IT
  }

  ctx.response.body = '0_o';
};

let test = async (ctx, next) => {
  console.log('log from line.js: ' + isDev);
};

module.exports = {
  'POST /line': fn_line,
  'GET /line': test
};
