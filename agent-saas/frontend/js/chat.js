// ===== Agent Chat Frontend =====

const API_BASE = '';

// Get agent ID from URL
const urlParams = new URLSearchParams(window.location.search);
const agentId = urlParams.get('agent');

if (!agentId) {
  document.getElementById('chatMessages').innerHTML = `
    <div class="message ai" style="color: #ff4141;">
      ❌ No agent specified. Please use your unique agent link.
    </div>
  `;
}

const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const chatMessages = document.getElementById('chatMessages');

// Matrix canvas (reuse from main app)
function initMatrixCanvas() {
  const canvas = document.getElementById('matrixCanvas');
  const ctx = canvas.getContext('2d');
  
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  
  const fontSize = 14;
  const columns = Math.floor(canvas.width / fontSize);
  const drops = Array(columns).fill(1);
  
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()[]{}|;:,.<>?';
  
  function draw() {
    ctx.fillStyle = 'rgba(10, 10, 10, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#00ff41';
    ctx.font = fontSize + 'px monospace';
    
    for (let i = 0; i < drops.length; i++) {
      const char = chars[Math.floor(Math.random() * chars.length)];
      const x = i * fontSize;
      const y = drops[i] * fontSize;
      
      ctx.fillStyle = Math.random() > 0.9 ? '#ffffff' : '#00ff41';
      ctx.fillText(char, x, y);
      
      if (y > canvas.height && Math.random() > 0.975) {
        drops[i] = 0;
      }
      drops[i]++;
    }
  }
  
  setInterval(draw, 50);
  
  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });
}

function addMessage(text, isUser = false) {
  const div = document.createElement('div');
  div.className = `message ${isUser ? 'user' : 'ai'}`;
  div.textContent = text;
  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function showTyping() {
  const div = document.createElement('div');
  div.className = 'message ai typing';
  div.id = 'typingIndicator';
  div.textContent = '...';
  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function hideTyping() {
  const typing = document.getElementById('typingIndicator');
  if (typing) typing.remove();
}

async function sendMessage() {
  const message = messageInput.value.trim();
  if (!message || !agentId) return;

  addMessage(message, true);
  messageInput.value = '';
  messageInput.style.height = 'auto';
  sendBtn.disabled = true;
  showTyping();

  try {
    const response = await fetch(`${API_BASE}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agent_id: agentId, message })
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const result = await response.json();

    hideTyping();

    if (result.response) {
      addMessage(result.response, false);
    } else if (result.error) {
      addMessage('⚠️ ' + result.error, false);
    } else {
      addMessage('No response from agent. Please try again.', false);
    }
  } catch (error) {
    hideTyping();
    addMessage('🔌 Connection lost. Please check your internet and try again.', false);
    console.error('Chat error:', error);
  } finally {
    sendBtn.disabled = false;
    messageInput.focus();
  }
}

// Event listeners
sendBtn.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') sendMessage();
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  initMatrixCanvas();
});