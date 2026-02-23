const express = require('express');
const line = require('@line/bot-sdk');
require('dotenv').config();

const app = express();

const client = new line.Client({
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET
});

const bookings = [];
const courses = {
  '1': { name: '朝陽瑜伽', duration: 45, price: 300, capacity: 15 },
  '2': { name: '寧靜冥想', duration: 60, price: 350, capacity: 12 },
  '3': { name: '力量瑜伽', duration: 50, price: 380, capacity: 15 },
  '4': { name: '柔和伸展', duration: 45, price: 300, capacity: 15 },
  '5': { name: '心靈醒覺', duration: 75, price: 400, capacity: 15 },
  '6': { name: '親子瑜伽', duration: 40, price: 250, capacity: 10 }
};

app.use(express.json());

app.post('/webhook', line.middleware({ channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN }), (req, res) => {
  Promise.all(req.body.events.map(handleEvent))
    .then((result) => res.json(result))
    .catch((err) => {
      console.error(err);
      res.status(500).end();
    });
});

async function handleEvent(event) {
  if (event.type !== 'message' || event.message.type !== 'text') {
    return Promise.resolve(null);
  }

  const userMessage = event.message.text;

  if (userMessage === '查看課程') {
    return handleViewCourses(event.replyToken);
  } else if (userMessage === '立即預約') {
    return handleQuickBooking(event.replyToken);
  } else {
    return client.replyMessage(event.replyToken, {
      type: 'text',
      text: '👋 歡迎來到九容瑜伽！\n請選擇：',
      quickReply: {
        items: [
          { type: 'action', action: { type: 'message', label: '查看課程', text: '查看課程' } },
          { type: 'action', action: { type: 'message', label: '立即預約', text: '立即預約' } }
        ]
      }
    });
  }
}

function handleViewCourses(replyToken) {
  const courseList = Object.entries(courses)
    .map(([id, course]) => `${course.name} - ${course.duration}分鐘 $${course.price}`)
    .join('\n');
  
  return client.replyMessage(replyToken, {
    type: 'text',
    text: `📚 九容瑜伽課程:\n\n${courseList}\n\n輸入「立即預約」開始預約！`
  });
}

function handleQuickBooking(replyToken) {
  const items = Object.entries(courses).map(([id, course]) => ({
    type: 'action',
    action: { type: 'message', label: course.name, text: `預約 ${course.name}` }
  }));

  return client.replyMessage(replyToken, {
    type: 'text',
    text: '選擇要預約的課程：',
    quickReply: { items }
  });
}

app.get('/', (req, res) => {
  res.json({ message: '九容瑜伽 LINE Bot 正在運行' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`LINE Bot 在 port ${PORT} 上運行`);
});
