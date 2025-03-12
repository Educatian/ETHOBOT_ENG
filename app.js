// Firebase 관련 임포트 주석 처리
// import { db } from './firebase.js';
// import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

// DOM 요소
const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');

// CORS 프록시 URL 제거
// const CORS_PROXY = 'https://cors-anywhere.herokuapp.com/';
const API_URL = 'https://api.openai.com/v1/chat/completions';

// API 키 저장 변수
let API_KEY = localStorage.getItem('openai_api_key') || '';

// 디버깅을 위한 즉시 실행 함수
(function checkElements() {
    console.log('Checking DOM elements:');
    console.log('chatMessages:', chatMessages);
    console.log('userInput:', userInput);
    console.log('sendButton:', sendButton);
    
    if (!chatMessages || !userInput || !sendButton) {
        console.error('Some DOM elements are missing!');
    }
})();

// 모드별 시스템 프롬프트 정의
const MODE_PROMPTS = {
    ethics: `You are an educational facilitator leading Socratic dialogues on AI Ethics.
        Guide the conversation with these principles:

        Dialogue Principles:
        1. Start with a warm, friendly tone
        2. Guide through questions rather than direct answers
        3. Deepen exploration based on learner responses
        4. Present real cases step by step
        5. Maintain a collaborative approach to ethical inquiry

        Key Areas:
        - Algorithmic Bias and Fairness
        - AI Privacy and Data Protection
        - AI System Transparency
        - Ethical AI Decision Making
        - AI Safety and Responsibility

        Response Approach:
        1. First assess learner's current understanding
        2. Present specific cases or scenarios
        3. Use follow-up questions for deeper thinking
        4. Respect learner's views while offering new perspectives
        5. Provide hints for further exploration`,
    
    case: `You are an expert helping design AI Ethics education.
        Guide the conversation as follows:

        Dialogue Principles:
        1. Listen to educator's ideas first
        2. Guide through step-by-step questions
        3. Provide applicable examples
        4. Offer context-specific advice
        5. Foster collaborative development

        Exploration Process:
        1. Identify educational goals and audience
        2. Assess current situation and resources
        3. Explore teaching methods
        4. Support activity design
        5. Discuss evaluation methods

        Response Approach:
        - Begin with open questions
        - Expand ideas through examples
        - Suggest practical steps
        - Highlight additional considerations`,
    
    dilemma: `You are a Socratic facilitator exploring AI Ethics dilemmas.
        Guide discussions as follows:

        Dialogue Principles:
        1. Explore various perspectives neutrally
        2. Expand thinking through questions
        3. Reveal dilemma complexity gradually
        4. Build on participant responses
        5. Guide ethical reasoning

        Exploration Process:
        1. Check basic dilemma understanding
        2. Explore stakeholder perspectives
        3. Consider potential impacts
        4. Discuss possible solutions
        5. Examine deeper ethical implications

        Response Approach:
        - Ask thoughtful, paced questions
        - Illuminate different aspects
        - Build on participant answers
        - Present new scenarios/perspectives`
};

// 현재 선택된 모드
let currentMode = 'ethics';

// 모드 버튼 이벤트 리스너
document.querySelectorAll('.mode-btn').forEach(button => {
    button.addEventListener('click', () => {
        // 이전 활성 버튼에서 active 클래스 제거
        document.querySelector('.mode-btn.active').classList.remove('active');
        // 새로운 버튼에 active 클래스 추가
        button.classList.add('active');
        // 현재 모드 업데이트
        currentMode = button.dataset.mode;
        // 모드 변경 메시지 표시
        displayMessage(`[Mode Change] Switched to ${button.textContent.trim()} mode.`, false);
    });
});

// API 키 입력 UI 추가
function setupApiKeyInput() {
  const apiKeyContainer = document.createElement('div');
  apiKeyContainer.classList.add('api-key-container');
  
  const apiKeyLabel = document.createElement('div');
  apiKeyLabel.innerHTML = '<strong>OpenAI API Key</strong><br>Enter your API key to use the chatbot. Your key is stored only in your browser and never sent to our servers.<br><a href="https://platform.openai.com/api-keys" target="_blank">Get your API key here</a>';
  apiKeyLabel.classList.add('api-key-label');
  
  const apiKeyInput = document.createElement('input');
  apiKeyInput.type = 'password';
  apiKeyInput.placeholder = 'Enter your OpenAI API key';
  apiKeyInput.value = API_KEY;
  apiKeyInput.id = 'api-key-input';
  
  const saveButton = document.createElement('button');
  saveButton.textContent = 'Save API Key';
  saveButton.addEventListener('click', () => {
    API_KEY = apiKeyInput.value;
    localStorage.setItem('openai_api_key', API_KEY);
    alert('API key saved!');
  });
  
  apiKeyContainer.appendChild(apiKeyLabel);
  apiKeyContainer.appendChild(apiKeyInput);
  apiKeyContainer.appendChild(saveButton);
  
  // 사이드바에 추가
  document.querySelector('.sidebar').appendChild(apiKeyContainer);
}

// 페이지 로드 시 API 키 입력 UI 설정
document.addEventListener('DOMContentLoaded', () => {
  setupApiKeyInput();
  console.log('DOM Content Loaded');
  
  // 버튼 클릭 이벤트
  sendButton.addEventListener('click', () => {
    console.log('Send button clicked');
    window.sendMessage();
  });
  
  // 엔터 키 이벤트
  userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      console.log('Enter key pressed');
      window.sendMessage();
    }
  });
  
  // 초기 메시지 표시
  displayMessage(`Hello! I'm ETHOBOT! 😊

I'm your interactive educational assistant for exploring and understanding AI Ethics in education.

I can help you with:
• AI Ethics Education Concepts (Current Mode)
• Learning Design for AI Ethics Education
• Generating Ethical Dilemma Discussion Topics in Education

What topic interests you? Let's explore together.`, false);
});

// 메시지 전송 함수
window.sendMessage = async function() {
    console.log('sendMessage function called');
    const messageText = userInput.value.trim();
    if (messageText === '') return;
    
    console.log('Sending message:', messageText);
    
    if (!API_KEY) {
        displayMessage("Please enter your OpenAI API key first.", false);
        return;
    }
    
    // 사용자 메시지 표시
    displayMessage(messageText, true);
    userInput.value = '';
    
    try {
        // 로딩 메시지 표시
        const loadingElement = document.createElement('div');
        loadingElement.classList.add('message', 'bot-message', 'loading');
        loadingElement.textContent = 'Generating response...';
        chatMessages.appendChild(loadingElement);
        
        // 요청 데이터 구성
        const requestData = {
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: MODE_PROMPTS[currentMode]
                },
                {
                    role: "user",
                    content: messageText
                }
            ],
            max_tokens: 1000,
            temperature: 0.7
        };
        
        console.log('Request data:', JSON.stringify(requestData));
        
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify(requestData)
        });

        // 로딩 메시지 제거
        if (loadingElement.parentNode) {
            chatMessages.removeChild(loadingElement);
        }

        console.log('Response status:', response.status);
        const responseText = await response.text();
        console.log('Raw response:', responseText);
        
        if (!response.ok) {
            throw new Error(`API error: ${response.status} - ${responseText}`);
        }

        const data = JSON.parse(responseText);
        console.log('Parsed response data:', data);
        
        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
            throw new Error('Invalid response format from API');
        }
        
        const botResponse = data.choices[0].message.content;
        
        // 챗봇 응답 표시
        displayMessage(botResponse, false);
        
    } catch (error) {
        console.error("Error in sendMessage:", error);
        displayMessage("Sorry, an error occurred while generating the response. Please try again later. Error: " + error.message, false);
    }
};

// 메시지 표시 함수
function displayMessage(message, isUser) {
    console.log('Displaying message:', message, 'isUser:', isUser);
    
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    messageElement.classList.add(isUser ? 'user-message' : 'bot-message');
    
    const formattedMessage = message.replace(/\n/g, '<br>');
    messageElement.innerHTML = formattedMessage;
    
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}