const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// 파이어베이스 어드민 초기화
try {
    const serviceAccount = require('./serviceAccountKey.json');
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
    console.log('파이어베이스 연결 완료');
} catch (e) {
    console.error('serviceAccountKey.json 파일을 확인해주세요:', e.message);
}

let latestOrder = null;

app.post('/api/send-order', async (req, res) => {
    const { orderDate, total, details } = req.body;
    latestOrder = {
        id: Date.now(),
        orderDate,
        total,
        details: details || '신규 발주가 접수되었습니다.',
        time: new Date().toLocaleTimeString('ko-KR')
    };

    // 진짜 APK가 구독 중인 'orders' 채널로 백그라운드 상단 바 푸시 발송!
    const message = {
        notification: {
            title: '🚨 양평칼국수 신규 발주 도착!',
            body: `[${orderDate}] ${details} (합계: ${Number(total).toLocaleString()}원)`
        },
        topic: 'orders',
        android: {
            priority: 'high',
            notification: {
                sound: 'default',
                channelId: 'order_alert_channel'
            }
        }
    };

    try {
        await admin.messaging().send(message);
        console.log('상단 바 푸시 전송 성공!');
    } catch (error) {
        console.error('푸시 전송 실패:', error);
    }

    res.json({ success: true });
});

app.get('/api/check-order', (req, res) => {
    res.json({ order: latestOrder });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`서버가 ${PORT}번 포트에서 작동 중입니다.`);
});
