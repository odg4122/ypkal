const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

let latestOrder = null;

// 사장님 발주 앱에서 발주를 보낼 때 받는 곳
app.post('/api/send-order', (req, res) => {
    const { orderDate, total, details } = req.body;
    latestOrder = {
        id: Date.now(),
        orderDate: orderDate,
        total: total,
        details: details || '신규 발주가 접수되었습니다.',
        time: new Date().toLocaleTimeString('ko-KR')
    };
    console.log('새 발주 저장됨:', latestOrder);
    res.json({ success: true });
});

// 납품업체 수신용 APK에서 새 발주가 있는지 확인할 때 보내주는 곳
app.get('/api/check-order', (req, res) => {
    res.json({ order: latestOrder });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`발주 서버가 ${PORT}번 포트에서 실행 중입니다.`);
});