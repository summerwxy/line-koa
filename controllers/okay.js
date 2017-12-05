// 開發測試用的版本 Line -> Dialogflow -> Heroku
const axios = require('axios');
const crypto = require('crypto');
const channelId = process.env.CHANNEL_ID;
const channelSecret = process.env.CHANNEL_SECRET;
const channelAccessToken = process.env.CHANNEL_ACCESS_TOKEN;
const isDev = process.env.IS_DEV === 'true';
const unsplash = require('../commons/api_unsplash');

let toArray = function (maybeArr) {
  return Array.isArray(maybeArr) ? maybeArr : [maybeArr];
};

// 因為設置上, 現在是 Dialogflow 發通知過來, 所以不是這個驗證方式
let signatureValidation = function (ctx) {
  const body = ctx.request.rawBody;
  const signature = crypto.createHmac('SHA256', channelSecret).update(body).digest('base64');
  const headerSign = ctx.request.header['x-line-signature'];
  return signature === headerSign;
};

let sendReplyMessage = function (replyToken, messages) {
  if (isDev) {
    console.log('>>>>> replyToken-> ' + replyToken);
    console.log('>>>>> messages-> ' + JSON.stringify(messages));
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

let isFromDialogflow = function(ctx) {
  return ctx.headers[process.env.DIALOGFOLW_HEADERS_KEY] === process.env.DIALOGFOLW_HEADERS_VALUE;
};
// ====== start of handle message =====
let handleMessage = async function (event) {
  let text = event.message.text;
  let result = { type: 'text', text: text };
  if (text == '圖') {
    let foo = await unsplash();
    result = { "type": "image", "originalContentUrl": foo.data.urls.regular, "previewImageUrl": foo.data.urls.thumb }
  }
  return result;
};
// ====== end of handle message =====

let fn_dev = async (ctx, next) => {
  if (!isFromDialogflow(ctx)) {
    // TODO: 不想有反應, 應該怎麼處理??
    ctx.response.status = 403;
    ctx.response.body = '403 Forbidden';
    return;
  }

/*
 { responseId: '4b44c518-3682-4f00-b329-291c9afad44c',
   queryResult: 
    { queryText: '哈哈',
      action: 'input.unknown',
      parameters: {},
      allRequiredParamsPresent: true,
      fulfillmentMessages: [ [Object] ],
      intent: 
       { name: 'projects/api-ai-7f155/agent/intents/efa49cfc-3058-406d-a7f2-1c5580d19e0c',
         displayName: 'Default Fallback Intent' },
      intentDetectionConfidence: 1,
      diagnosticInfo: {},
      languageCode: 'zh-tw' },
   originalDetectIntentRequest: { payload: { data: [Object], source: 'line' } },
   session: 'projects/api-ai-7f155/agent/sessions/6716b2a1-fb12-4514-b687-de5f2300ebd8' }
 */
/*
  const body = ctx.request.body;
  const events = body.events;
  if (events[0].replyToken == '00000000000000000000000000000000') {
    // DO NOTHING. 驗證的時候有特殊的 replyToken
  } else if (events.length == 1 && events[0].type == 'message') {
    const event = events[0];
    const replyToken = event.replyToken;
    let messages = { };
    if (event.message.type == 'text') {
      messages = await handleMessage(event);
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
  */

  // Webhook call failed. Error: Failed to parse webhook JSON response: Expect message object but got: "0_o".
  ctx.response.header = {'Content-type': 'application/json'};
  let body = {};
  body.fulfillment_text = '11111';

  ctx.response.body = JSON.stringify(body);
};

let fn_test = async (ctx, next) => {
  // test code here
  /*
  var urlToImage = require('url-to-image');

  var options = {
      width: 600,
      height: 800,
      // Give a short time to load additional resources
      requestTimeout: 100
  }

  urlToImage('http://www.baidu.com', './static/baidu.png', options)
  .then(function() {
    console.log('okay');
    // do stuff with google.png
  })
  .catch(function(err) {
    console.log('create file fail');
    console.error(err);
  });
  console.log(process.env.IS_DEV);
  */
};

module.exports = {
  'POST /okay': fn_dev,
  'GET /okay': fn_test
};
