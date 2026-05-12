// ===== M.ai.K.R Frontend Application =====

const API_BASE = ''; // Same origin — backend serves frontend and API on same port

// Stripe Public Key
const STRIPE_PK = 'pk_test_51TH2qPBCyZF2z3lcC3U1cdUk8iyzQ39FU2XQV3OPFmt4CrF4iuqxIqHrVfU0zW9LFdWHimdKQwrmQdS4eaBtjj8a00QCfkbEEd';

// State
let currentStep = 1;
const totalSteps = 4;
let selectedPlan = 'growth';
let selectedTier = 'standard';

// Plan pricing
const plans = {
  value: { name: 'Value', price: 4499, id: 'price_value' },
  growth: { name: 'Growth', price: 9900, id: 'price_growth' },
  scale: { name: 'Scale', price: 19900, id: 'price_scale' },
  enterprise: { name: 'Enterprise', price: 49900, id: 'price_enterprise' }
};

// DOM Elements
const form = document.getElementById('agentForm');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const formSteps = document.querySelectorAll('.form-step');
const stepBoxes = document.querySelectorAll('.step-box');
const pricingCards = document.querySelectorAll('.pricing-card');

// Matrix Canvas
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
      ctx.fillStyle = Math.random() > 0.9 ? '#ffffff' : '#00ff41';
      ctx.fillText(char, i * fontSize, drops[i] * fontSize);
      if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
      drops[i]++;
    }
  }
  setInterval(draw, 50);
  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });
}

// Tech Stack Click Handlers
function initTechStack() {
  const stackItems = document.querySelectorAll('.stack-item');
  const infoBox = document.getElementById('techInfo');
  
  stackItems.forEach(item => {
    item.style.cursor = 'pointer';
    item.addEventListener('click', () => {
      const info = item.getAttribute('data-info');
      infoBox.innerHTML = '<p>' + info + '</p>';
      infoBox.classList.add('show');
      
      stackItems.forEach(i => i.classList.remove('selected'));
      item.classList.add('selected');
    });
  });
}

// Chat Demo Functionality
function initChatDemo() {
  const chatInput = document.querySelector('.chat-input input');
  const chatSendBtn = document.querySelector('.chat-input button');
  const chatWindow = document.querySelector('.chat-window');
  
  function sendDemoMessage() {
    const message = chatInput.value.trim();
    if (!message) return;
    
    const userMsg = document.createElement('div');
    userMsg.className = 'chat-message user';
    userMsg.textContent = message;
    chatWindow.appendChild(userMsg);
    chatWindow.scrollTop = chatWindow.scrollHeight;
    chatInput.value = '';
    
    setTimeout(() => {
      const aiMsg = document.createElement('div');
      aiMsg.className = 'chat-message ai';
      aiMsg.textContent = 'Thanks for your message! Your custom AI agent will respond based on your industry and brand tone. Complete the questionnaire to activate your agent!';
      chatWindow.appendChild(aiMsg);
      chatWindow.scrollTop = chatWindow.scrollHeight;
    }, 1000);
  }
  
  chatSendBtn.addEventListener('click', sendDemoMessage);
  chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendDemoMessage();
  });
}

// Stripe Checkout
async function initiateCheckout() {
  const btn = document.getElementById('nextBtn');
  btn.disabled = true;
  btn.textContent = 'Processing...';
  
  try {
    // Get form data
    console.log('Submitting with plan:', selectedPlan);
    const agentName = document.getElementById('agentName').value;
    const businessName = document.getElementById('businessName').value;
    const industry = document.getElementById('industry').value;
    const targetAudience = document.getElementById('targetAudience').value;
    const tone = document.getElementById('tone').value;
    const dataAgreement = document.getElementById('agreeTerms').checked;
    if (!dataAgreement) {
      alert('Please agree to the Terms of Service to continue.');
      btn.disabled = false;
      btn.textContent = 'Continue to Checkout';
      return;
    }
    
    // Call backend to create checkout session
    const response = await fetch(API_BASE + '/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        plan: selectedPlan,
        modelTier: selectedTier,
        agentName,
        businessName,
        industry,
        targetAudience,
        tone,
        dataAgreement
      })
    });
    
    const data = await response.json();
    
    if (data.url) {
      // Redirect to Stripe checkout
      window.location.href = data.url;
    } else {
      alert('Error creating checkout session. Please try again.');
    }
  } catch (error) {
    console.error('Checkout error:', error);
    alert('Payment error. Please try again.');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Create Agent';
  }
}

function showTerms() {
  document.getElementById('termsModal').style.display = 'flex';
}

function selectTier(tier) {
  selectedTier = tier;
  document.querySelectorAll('.tier-card').forEach(c => c.classList.remove('selected'));
  document.querySelector('.tier-card[data-tier="' + tier + '"]').classList.add('selected');
}

// Hash-based step routing
function navigateToStep(step) {
  if (step < 1 || step > totalSteps) return;
  if (step > currentStep && !validateStep(currentStep)) return; // can't advance without validation
  if (step < currentStep) {
    // always allow going back
  } else if (step > currentStep + 1) return; // can't skip steps
  currentStep = step;
  window.location.hash = 'step-' + step;
  renderStep(step);
  document.querySelector('.form-panel').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function renderStep(step) {
  // Hide all form steps, show only current
  formSteps.forEach((fs, i) => {
    const isActive = (i + 1 === step);
    fs.style.display = isActive ? 'block' : 'none';
    fs.classList.toggle('active', isActive);
  });

  updateProgressBar(step);

  prevBtn.style.display = step > 1 ? 'inline-block' : 'none';
  nextBtn.textContent = step === totalSteps ? 'Create Agent' : 'Continue';
  nextBtn.style.display = 'inline-block';

  // Remove any existing review summary
  const existing = document.querySelector('.review-summary');
  if (existing) existing.remove();

  if (step === totalSteps) {
    showReviewSummary();
  }
}

function updateProgressBar(step) {
  let progress = document.querySelector('.step-progress');
  if (!progress) {
    progress = document.createElement('div');
    progress.className = 'step-progress';
    document.querySelector('.form-panel').prepend(progress);
    // Make dots clickable
    progress.addEventListener('click', (e) => {
      const dot = e.target.closest('.progress-dot');
      if (!dot) return;
      const dotStep = parseInt(dot.dataset.step);
      // Can only go to completed steps (dots to the left) or current
      if (dotStep < step) navigateToStep(dotStep);
    });
  }

  const labels = ['', 'Basics', 'Audience', 'Use Cases', 'Plan'];
  let html = '';
  for (let i = 1; i <= totalSteps; i++) {
    const isComplete = i < step;
    const isCurrent = i === step;
    const cls = isComplete ? 'done' : isCurrent ? 'current' : 'pending';
    html += `<div class="progress-dot ${cls}" data-step="${i}" style="cursor:${isComplete?'pointer':'default'}">
      <span class="dot-num">${isComplete ? '✓' : i}</span>
      <span class="dot-label">${labels[i]}</span>
    </div>`;
    if (i < totalSteps) html += `<div class="progress-line ${isComplete?'done':''}"></div>`;
  }
  progress.innerHTML = html;
}

function showReviewSummary() {
  const summary = document.createElement('div');
  summary.className = 'review-summary';
  const planLabels = { value: 'Value', growth: 'Growth', scale: 'Scale', enterprise: 'Enterprise' };
  const tierLabels = { standard: 'Standard', premium: 'Premium', elite: 'Elite' };
  summary.innerHTML = `
    <div class="review-item"><strong>Agent:</strong> ${escHtml(document.getElementById('agentName').value)}</div>
    <div class="review-item"><strong>Business:</strong> ${escHtml(document.getElementById('businessName').value)}</div>
    <div class="review-item"><strong>Industry:</strong> ${escHtml(document.getElementById('industry').value)}</div>
    <div class="review-item"><strong>Plan:</strong> ${planLabels[selectedPlan] || selectedPlan} · $${(plans[selectedPlan]?.price || 0)/100}/mo</div>
    <div class="review-item"><strong>Intelligence:</strong> ${tierLabels[selectedTier] || selectedTier}</div>
  `;
  const termsSection = document.querySelector('.form-step[data-step="4"] .terms-section');
  if (termsSection) {
    termsSection.parentNode.insertBefore(summary, termsSection);
  }
}

function escHtml(str) {
  const div = document.createElement('div');
  div.textContent = str || '';
  return div.innerHTML;
}

// Validation
function validateStep(step) {
  const currentFormStep = document.querySelector('.form-step[data-step="' + step + '"]');
  const required = currentFormStep.querySelectorAll('[required]');
  let valid = true;
  required.forEach(field => {
    if (!field.value.trim()) {
      field.style.borderColor = '#ff4141';
      valid = false;
    } else {
      field.style.borderColor = '';
    }
  });
  return valid;
}

// Pricing Selection
pricingCards.forEach((card, index) => {
  const planKeys = ['value', 'growth', 'scale', 'enterprise'];
  card.addEventListener('click', () => {
    pricingCards.forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');
    selectedPlan = planKeys[index];
    console.log('Selected plan:', selectedPlan);
  });
});

// Navigation
nextBtn.addEventListener('click', () => {
  if (validateStep(currentStep)) {
    if (currentStep < totalSteps) {
      navigateToStep(currentStep + 1);
    } else {
      initiateCheckout();
    }
  }
});

prevBtn.addEventListener('click', () => {
  if (currentStep > 1) navigateToStep(currentStep - 1);
});

// Browser back/forward
window.addEventListener('hashchange', () => {
  const step = parseInt(window.location.hash.replace('#step-', '')) || 1;
  currentStep = step;
  renderStep(step);
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  initMatrixCanvas();
  initTechStack();
  initChatDemo();
  const initialStep = window.location.hash.startsWith('#step-') ? parseInt(window.location.hash.replace('#step-', '')) : 1;
  currentStep = initialStep;
  renderStep(initialStep);
});
