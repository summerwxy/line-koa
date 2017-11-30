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
  } else if (messages) {
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
      console.log(event);
    } else if (event.message.type == 'sticker') { // {"type":"sticker","id":"7068005370700","stickerId":"4","packageId":"1"}
      messages = { type: 'sticker', stickerId: event.message.stickerId, packageId: event.message.packageId } 
    } else if (event.message.type == 'image') { // {"type":"image","id":"7068019237470"}
      messages = { type: 'text', text: '[image]' }; 
    } else if (event.message.type == 'video') { // {"type":"video","id":"7068126078031"}}]}
      messages = { type: 'text', text: '[video]' };
    } else if (event.message.type == 'audio') { // {"type":"audio","id":"7068132933428"}
      messages = { type: 'text', text: '[audio]' };
    } else if (event.message.type == 'location') { // {"type":"location","id":"7068133281924","title":"Location","latitude":31.254497,"longitude":120.607647}
      messages = { type: 'text', text: '[location]' };
    } else { // imagemap
      console.log(ctx.request.rawBody)
    }
    sendReplyMessage(replyToken, messages);
  } else if (events.length == 1 && events[0].type == 'unfollow') { // {"events":[{"type":"unfollow","source":{"userId":"U5f3ced7c52765327a5be68f7a38f6875","type":"user"},"timestamp":1512018350831}]}
    console.log('unfollow'); 
  } else if (events.length == 1 && events[0].type == 'follow') { // {"events":[{"type":"follow","replyToken":"4348594269d24aec90fb3e4f10e37ff1","source":{"userId":"U5f3ced7c52765327a5be68f7a38f6875","type":"user"},"timestamp":1512018441894}]}
    console.log('follow'); 
  } else if (events.length == 1 && events[0].type == 'join') { // {"events":[{"type":"join","replyToken":"57d35eaa893f439dacd6ba37db9d9610","source":{"roomId":"Reca5819b6c7671859cdbc3596c055458","type":"room"},"timestamp":1512018529797}]}
    console.log('join'); 
    console.log(events);
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
