const express = require('express');
const cors = require('cors');
const app = express();

// CORS 및 JSON 파싱 설정
app.use(cors());
app.use(express.json());

// 가장 최근 발주 데이터를 기억할 메모리 변수
let latestOrder = null;

// 1. 서버 정상 작동 확인용 루트 경로
app.get('/', (req, res) => {
    res.send('🍜 양평칼국수 발주 서버가 정상 가동 중입니다!');
});

// 2. 수신 앱(본점 대시보드)이 5초마다 신규 발주를 체크하는 API (GET)
app.get('/api/check-order', (req, res) => {
    if (latestOrder) {
        res.json({ order: latestOrder });
    } else {
        res.json({ order: null });
    }
});

// 3. 지점 발주 앱에서 전송 버튼을 누를 때 데이터를 받는 API (POST)
app.post('/api/order', (req, res) => {
    const { branch, orderDate, total, details } = req.body;

    // 데이터 유효성 검사
    if (!branch || !details || total === undefined) {
        return res.status(400).json({ success: false, message: '필수 데이터(지점, 내용, 총액)가 누락되었습니다.' });
    }

    // 최신 발주 정보 업데이트 (고유 ID 부여)
    latestOrder = {
        id: Date.now(),
        branch: branch,
        orderDate: orderDate || new Date().toLocaleString(),
        total: Number(total) || 0,
        details: details
    };

    console.log(`[신규 발주 접수 완료] 지점: ${branch} | 총액: ${total}원 | 내용: ${details}`);
    
    res.json({ 
        success: true, 
        message: '발주가 본점 수신 서버에 성공적으로 접수되었습니다.',
        order: latestOrder 
    });
});

// 포트 설정 (Render 환경 변수 포트 또는 기본 3000번)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
