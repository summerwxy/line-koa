// 导入koa，和koa 1.x不同，在koa2中，我们导入的是一个class，因此用大写的Koa表示:
const Koa = require('koa');

// 注意require('koa-router')返回的是函数:
const router = require('koa-router')();
const bodyParser = require('koa-bodyparser');

// bot
const Telegraf = require('telegraf');
const env = require('./commons/env_variables');
const bot = new Telegraf(env('TELEGRAM_TOKEN'));
bot.telegram.setWebhook('https://line-koa.herokuapp.com/secret-path');
bot.command('help', (ctx) => ctx.reply('Try send a sticker!'));
bot.hears('hi', (ctx) => ctx.reply('Hey there!'));
bot.hears(/buy/i, (ctx) => ctx.reply('Buy-buy!'));
bot.on('sticker', (ctx) => ctx.reply('👍'));


// 导入controller middleware:
const controller = require('./commons/controller');

// 创建一个Koa对象表示web app本身:
const app = new Koa();

app.use(bodyParser());

// 对于任何请求，app将调用该异步函数处理请求：
app.use(async (ctx, next) => {
    console.log(`${ctx.request.method} ${ctx.request.url}`); // 打印URL
    await next(); // 调用下一个middleware
});

app.use(async (ctx, next) => {
    const start = new Date().getTime(); // 当前时间
    await next(); // 调用下一个middleware
    const ms = new Date().getTime() - start; // 耗费时间
    console.log(`Time: ${ms}ms`); // 打印耗费时间
});

// bot
app.use(async (ctx, next) => {
    if (ctx.method === 'POST' && ctx.url === '/secret-path') {
        console.log('bot');
        bot.handleUpdate(ctx.request.body, ctx.response);
    } else {
        console.log('next');
        next();
    }
})

app.use(controller());
app.use(require('koa-static-server')({rootDir: 'static', rootPath: '/static'}))


// 在端口3000监听:
const port = process.env.PORT || 3000
app.listen(port);
console.log('app started at port ' + port + '...');
