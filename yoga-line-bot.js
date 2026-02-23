const express = require('express');
const line = require('@line/bot-sdk');
require('dotenv').config();

const app = express();

// 檢查環境變數
if (!process.env.LINE_CHANNEL_ACCESS_TOKEN || !process.env.LINE_CHANNEL_SECRET) {
  console.error('Missing LINE credentials in environment variables');
  process.exit(1);
}

const client = new line.Client({
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 健康檢查
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: '九容瑜伽 LINE Bot 運行中' });
});

// Webhook
app.post('/webhook', line.middleware({ 
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET 
}), (req, res) => {
  Promise.all(req.body.events.map(handleEvent))
    .then((result) => res.json(result))
    .catch((err) => {
      console.error('Error:', err);
      res.status(500).end();
    });
});

async function handleEvent(event) {
  if (event.type !== 'message') return Promise.resolve(null);
  if (event.message.type !== 'text') return Promise.resolve(null);

  const text = event.message.text;

  console.log(`收到訊息: ${text}`);

  if (text === '查看課程') {
    return client.replyMessage(event.replyToken, {
      type: 'text',
      text: '📚 九容瑜伽課程\n\n1️⃣ 朝陽瑜伽 - 45分鐘 $300\n2️⃣ 寧靜冥想 - 60分鐘 $350\n3️⃣ 力量瑜伽 - 50分鐘 $380\n4️⃣ 柔和伸展 - 45分鐘 $300\n5️⃣ 心靈醒覺 - 75分鐘 $400\n6️⃣ 親子瑜伽 - 40分鐘 $250'
    });
  }

  return client.replyMessage(event.replyToken, {
    type: 'text',
    text: '👋 歡迎來到九容瑜伽！輸入「查看課程」查看所有課程。'
  });
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`LINE Bot 在 port ${PORT} 上運行`);
});
