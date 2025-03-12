const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3001;

// API 키 제거
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";

// API 엔드포인트 URL
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// 테스트 엔드포인트
app.get('/test', (req, res) => {
  res.json({ message: '서버가 정상적으로 작동 중입니다.' });
});

app.post('/api/chat', async (req, res) => {
  console.log('API 요청 받음');
  console.log('요청 본문:', JSON.stringify(req.body, null, 2));
  
  try {
    console.log('OpenAI API 호출 중...');
    
    const response = await axios({
      method: 'post',
      url: OPENAI_API_URL,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      data: {
        ...req.body,
        model: "gpt-3.5-turbo",
        max_tokens: 500
      },
      timeout: 30000
    });
    
    if (response.data && response.data.choices && response.data.choices[0]) {
      console.log('OpenAI API 응답 성공');
      console.log('응답 데이터:', JSON.stringify(response.data, null, 2));
      res.json(response.data);
    } else {
      throw new Error('API 응답 형식이 올바르지 않습니다.');
    }
    
  } catch (error) {
    console.error('OpenAI API 오류:', error.message);
    
    if (error.response) {
      console.error('응답 데이터:', error.response.data);
      console.error('응답 상태:', error.response.status);
      res.status(error.response.status).json({
        error: '서버 오류',
        message: error.response.data.error?.message || error.message
      });
    } else if (error.request) {
      console.error('요청은 전송되었지만 응답이 없습니다');
      res.status(504).json({
        error: '게이트웨이 타임아웃',
        message: '서버 응답 시간이 초과되었습니다.'
      });
    } else {
      res.status(500).json({
        error: '서버 오류',
        message: error.message
      });
    }
  }
});

app.listen(PORT, () => {
  console.log(`서버가 http://localhost:${PORT}에서 실행 중입니다`);
  console.log(`테스트 URL: http://localhost:${PORT}/test`);
}); 