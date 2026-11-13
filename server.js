const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// 주문을 배열로 누적 저장 (서버 메모리에 안전하게 쌓임)
let orders = [];

app.get('/', (req, res) => {
    res.send('🍜 양평칼국수 발주 서버가 정상 가동 중입니다!');
});

// 1. 수신 앱이 체크할 때 가장 최근 주문을 반환하는 API
app.get('/api/check-order', (req, res) => {
    if (orders.length > 0) {
        // 가장 마지막에 들어온 최신 주문 전달
        const latestOrder = orders[orders.length - 1];
        res.json({ order: latestOrder, count: orders.length });
    } else {
        res.json({ order: null, count: 0 });
    }
});

// 2. 지점에서 발주를 보낼 때 누적 저장하는 API
app.post('/api/order', (req, res) => {
    const { branch, orderDate, total, details } = req.body;

    if (!branch || !details) {
        return res.status(400).json({ success: false, message: '필수 데이터가 누락되었습니다.' });
    }

    const newOrder = {
        id: Date.now(), // 고유 ID로 중복 방지
        branch: branch,
        orderDate: orderDate || new Date().toLocaleString(),
        total: Number(total) || 0,
        details: details
    };

    // 배열에 주문 추가 (최신 것이 맨 뒤로)
    orders.push(newOrder);
    
    // 메모리 과부하 방지용으로 최근 50개까지만 유지
    if (orders.length > 50) {
        orders.shift();
    }

    console.log(`[발주 접수 성공] 지점: ${branch} | 총액: ${total}원`);
    
    res.json({ 
        success: true, 
        message: '발주가 정상 접수되었습니다.',
        order: newOrder 
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
