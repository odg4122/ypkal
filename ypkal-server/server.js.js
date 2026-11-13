const express = require('express');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');
const cors = require('cors');

// 업로드해주신 파이어베이스 인증 키 연결
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const app = express();
app.use(bodyParser.json());
app.use(cors());

// 발주 앱에서 [발주 내역 저장하기]를 누를 때 호출되는 API
app.post('/api/send-order', async (req, res) => {
    try {
        const { orderDate, total, fcmToken } = req.body;

        // 납품업체 폰으로 전송할 푸시 메시지 내용
        const message = {
            notification: {
                title: `🥬 [새로운 발주 접수] ${orderDate}`,
                body: `총 발주 금액: ${Number(total).toLocaleString()}원`
            },
            token: fcmToken // 수신 기기의 FCM 토큰
        };

        const response = await admin.messaging().send(message);
        console.log('푸시 알림 전송 성공:', response);
        
        res.status(200).json({ success: true, message: '알림 전송 성공!', response });
    } catch (error) {
        console.error('푸시 알림 전송 실패:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`발주 알림 서버가 ${PORT}번 포트에서 실행 중입니다.`);
});