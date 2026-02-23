const express = require('express');
const line = require('@line/bot-sdk');

const app = express();
app.use(express.json());

const client = new line.Client({
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN || '',
  channelSecret: process.env.LINE_CHANNEL_SECRET || ''
});

app.get('/', (req, res) => res.json({ ok: true }));

app.post('/webhook', line.middleware({ 
  channelSecret: process.env.LINE_CHANNEL_SECRET 
}), (req, res) => {
  req.body.events.forEach(event => {
    if (event.type === 'message' && event.message.type === 'text') {
      client.replyMessage(event.replyToken, {
        type: 'text',
        text: '📚 九容瑜伽\n\n1. 朝陽瑜伽\n2. 寧靜冥想\n3. 力量瑜伽'
      });
    }
  });
  res.json({ ok: true });
});

app.listen(5000, () => console.log('Bot running on port 5000'));
