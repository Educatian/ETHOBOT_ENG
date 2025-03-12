const functions = require('firebase-functions');
const cors = require('cors')({origin: true});
const axios = require('axios');

exports.openai = functions.https.onRequest((request, response) => {
  cors(request, response, async () => {
    try {
      console.log('Request received');
      
      // 환경 변수에서 API 키 가져오기
      const apiKey = process.env.OPENAI_API_KEY || "";
      console.log('API key available:', !!apiKey);
      
      const result = await axios({
        method: 'post',
        url: 'https://api.openai.com/v1/chat/completions',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        data: request.body,
        timeout: 30000
      });
      
      console.log('OpenAI API response status:', result.status);
      response.json(result.data);
      
    } catch (error) {
      console.error('Error details:', error.message);
      if (error.response) {
        console.error('OpenAI error:', error.response.data);
      }
      response.status(500).json({
        error: 'Error processing request',
        message: error.message
      });
    }
  });
});