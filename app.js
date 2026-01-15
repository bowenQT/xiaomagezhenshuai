/**
 * 未发送信件焚烧炉 | The Unsent Crematorium
 * 主交互逻辑
 */

import { EmberSky } from './src/ember-sky.js';
import { supabase } from './src/supabase.js';

// ============================================
// State Management
// ============================================
const state = {
  phase: 'input', // 'input' | 'burning' | 'reply'
  message: '',
  recipient: '',
  persona: null, // 'gentle' | 'strict' | 'playful' | 'regretful'
  extractedQuote: '',
  isHolding: false,
  holdStartTime: 0,
  holdDuration: 1500, // 1.5 seconds to burn
  animationFrame: null
};

// ============================================
// DOM Elements
// ============================================
const elements = {
  ambientCanvas: document.getElementById('ambient-canvas'),
  inputSection: document.getElementById('input-section'),
  cremationSection: document.getElementById('cremation-section'),
  replySection: document.getElementById('reply-section'),
  messageInput: document.getElementById('unsent-message'),
  recipientInput: document.getElementById('recipient'),
  charCount: document.getElementById('char-current'),
  submitButton: document.getElementById('submit-button'),
  letterContent: document.getElementById('letter-content'),
  letter: document.getElementById('letter'),
  burnButton: document.getElementById('burn-button'),
  progressRing: document.getElementById('progress-ring'),
  fireCanvas: document.getElementById('fire-canvas'),
  envelope: document.getElementById('envelope'),
  replyContent: document.getElementById('reply-content'),
  replySignature: document.getElementById('reply-signature'),
  restartButton: document.getElementById('restart-button'),
  // V1.1 新元素
  personaChips: document.getElementById('persona-chips'),
  shareButton: document.getElementById('share-button'),
  shareModal: document.getElementById('share-modal'),
  modalClose: document.getElementById('modal-close'),
  shareCardPreview: document.getElementById('share-card-preview'),
  downloadButton: document.getElementById('download-button'),
  // V1.2 新元素
  emberTooltip: document.getElementById('ember-tooltip')
};

// ============================================
// Ambient Particle Background
// ============================================
class AmbientParticles {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.resize();
    this.init();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  init() {
    const particleCount = Math.floor((this.canvas.width * this.canvas.height) / 15000);
    for (let i = 0; i < particleCount; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        size: Math.random() * 2 + 0.5,
        speedY: Math.random() * 0.3 + 0.1,
        opacity: Math.random() * 0.5 + 0.1
      });
    }
    this.animate();
  }

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.particles.forEach(p => {
      p.y -= p.speedY;
      if (p.y < -10) {
        p.y = this.canvas.height + 10;
        p.x = Math.random() * this.canvas.width;
      }

      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(245, 158, 11, ${p.opacity})`;
      this.ctx.fill();
    });

    requestAnimationFrame(() => this.animate());
  }
}

// ============================================
// Fire Particle System
// ============================================
class FireParticles {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.isActive = false;
    this.resize();
  }

  resize() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.canvas.width = Math.min(500, window.innerWidth - 40);
    this.canvas.height = 300;
  }

  start() {
    this.isActive = true;
    this.canvas.classList.add('active');
    this.animate();
  }

  stop() {
    this.isActive = false;
    this.canvas.classList.remove('active');
    this.particles = [];
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  emit() {
    const centerX = this.canvas.width / 2;
    const baseY = this.canvas.height - 50;

    for (let i = 0; i < 3; i++) {
      this.particles.push({
        x: centerX + (Math.random() - 0.5) * 100,
        y: baseY,
        size: Math.random() * 20 + 10,
        speedX: (Math.random() - 0.5) * 2,
        speedY: -(Math.random() * 4 + 2),
        life: 1,
        decay: Math.random() * 0.02 + 0.01,
        hue: Math.random() * 30 + 20 // Orange to yellow
      });
    }
  }

  animate() {
    if (!this.isActive) return;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Emit new particles
    this.emit();

    // Update and draw particles
    this.particles = this.particles.filter(p => {
      p.x += p.speedX;
      p.y += p.speedY;
      p.speedY *= 0.98;
      p.life -= p.decay;
      p.size *= 0.97;

      if (p.life <= 0) return false;

      const gradient = this.ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
      gradient.addColorStop(0, `hsla(${p.hue}, 100%, 70%, ${p.life})`);
      gradient.addColorStop(0.5, `hsla(${p.hue - 10}, 100%, 50%, ${p.life * 0.5})`);
      gradient.addColorStop(1, `hsla(${p.hue - 20}, 100%, 30%, 0)`);

      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fillStyle = gradient;
      this.ctx.fill();

      return true;
    });

    requestAnimationFrame(() => this.animate());
  }
}

// ============================================
// AI Reply Generation
// ============================================
async function generateReply(message, recipient, persona) {
  try {
    const response = await fetch('/api/reply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, recipient, persona })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    // 保存金句用于分享
    state.extractedQuote = data.extracted_quote || '';
    return data.reply;
  } catch (error) {
    console.error('AI generation failed:', error);
    return generateFallbackReply(message, recipient);
  }
}



// 后备回复（当 AI 不可用时）
function generateFallbackReply(message, recipient) {
  return `收到你的信了。\n\n有些话，说出来需要很大的勇气，即使只是写给自己看。感谢你愿意释放这些情绪。\n\n希望这封来自远方的回信，能让你的心稍微轻松一些。无论发生什么，你值得被温柔以待。\n\n愿你一切都好。`;
}

// ============================================
// Phase Transitions
// ============================================
function showPhase(phase) {
  state.phase = phase;

  elements.inputSection.style.display = phase === 'input' ? 'flex' : 'none';
  elements.cremationSection.classList.toggle('active', phase === 'burning');
  elements.replySection.classList.toggle('active', phase === 'reply');
}

function transitionToCremate() {
  state.message = elements.messageInput.value.trim();
  state.recipient = elements.recipientInput.value.trim();

  if (!state.message) {
    elements.messageInput.focus();
    elements.messageInput.style.borderColor = 'var(--accent-ember)';
    setTimeout(() => {
      elements.messageInput.style.borderColor = '';
    }, 1000);
    return;
  }

  elements.letterContent.textContent = state.message;
  showPhase('burning');
}

async function transitionToReply() {
  showPhase('reply');

  // Show loading state
  elements.replyContent.classList.add('loading');
  elements.replyContent.textContent = '';

  // Open envelope animation
  setTimeout(() => {
    elements.envelope.classList.add('open');
  }, 300);

  // Generate AI reply
  try {
    const reply = await generateReply(state.message, state.recipient, state.persona);
    elements.replyContent.classList.remove('loading');

    // Typewriter effect
    await typewriterEffect(elements.replyContent, reply);

    // Show signature
    if (state.recipient) {
      elements.replySignature.textContent = `—— ${state.recipient}，于平行时空`;
    } else {
      elements.replySignature.textContent = '—— 来自平行时空的某人';
    }
  } catch (error) {
    elements.replyContent.classList.remove('loading');
    elements.replyContent.textContent = generateFallbackReply(state.message, state.recipient);
  }
}

// Typewriter effect
async function typewriterEffect(element, text) {
  element.textContent = '';
  for (let i = 0; i < text.length; i++) {
    element.textContent += text[i];
    await new Promise(resolve => setTimeout(resolve, 30 + Math.random() * 20));
  }
}

function restart() {
  state.message = '';
  state.recipient = '';
  state.persona = null;
  state.extractedQuote = '';

  // Reset persona chips
  document.querySelectorAll('.persona-chip').forEach(chip => {
    chip.classList.remove('active');
  });
  elements.messageInput.value = '';
  elements.recipientInput.value = '';
  elements.charCount.textContent = '0';
  elements.letter.classList.remove('burning');
  elements.envelope.classList.remove('open');
  elements.replyContent.textContent = '';
  elements.replySignature.textContent = '';
  showPhase('input');
}

// ============================================
// V1.1 Share Card Functions
// ============================================
let currentShareCardUrl = null;

async function openShareModal() {
  if (!elements.shareModal) return;

  elements.shareModal.classList.add('active');
  elements.shareCardPreview.innerHTML = '<p class="preview-loading">正在生成艺术卡片...</p>';
  elements.downloadButton.disabled = true;

  try {
    const response = await fetch('/api/share-card', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        quote: state.extractedQuote || '愿你一切都好',
        recipient: state.recipient || '那个人',
        count: Math.floor(Math.random() * 50000) + 10000
      })
    });

    if (!response.ok) {
      throw new Error('Failed to generate card');
    }

    const data = await response.json();

    if (data.success && data.image) {
      const imgSrc = data.isBase64
        ? `data:image/png;base64,${data.image}`
        : data.image;

      currentShareCardUrl = imgSrc;
      elements.shareCardPreview.innerHTML = `<img src="${imgSrc}" alt="平行时空信笺" />`;
      elements.downloadButton.disabled = false;
    } else {
      throw new Error('No image in response');
    }
  } catch (error) {
    console.error('Share card generation failed:', error);
    elements.shareCardPreview.innerHTML = `
      <div style="text-align: center; color: var(--text-secondary);">
        <p>🌟</p>
        <p style="font-size: 0.9rem; margin-top: 1rem;">卡片生成中遇到问题</p>
        <p style="font-size: 0.8rem; color: var(--text-muted);">${state.extractedQuote || '愿你一切都好'}</p>
      </div>
    `;
  }
}

function closeShareModal() {
  if (!elements.shareModal) return;
  elements.shareModal.classList.remove('active');
}

function downloadShareCard() {
  if (!currentShareCardUrl) return;

  const link = document.createElement('a');
  link.href = currentShareCardUrl;
  link.download = `parallel-letter-${Date.now()}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// ============================================
// Burn Interaction
// ============================================
let fireSystem = null;

function startHold(e) {
  e.preventDefault();
  if (state.isHolding) return;

  state.isHolding = true;
  state.holdStartTime = Date.now();
  elements.burnButton.classList.add('pressing');

  // Initialize fire system if needed
  if (!fireSystem) {
    fireSystem = new FireParticles(elements.fireCanvas);
  }
  fireSystem.start();

  updateHoldProgress();
}

function updateHoldProgress() {
  if (!state.isHolding) return;

  const elapsed = Date.now() - state.holdStartTime;
  const progress = Math.min(elapsed / state.holdDuration, 1);

  // Update progress ring (circumference is 283)
  const offset = 283 * (1 - progress);
  elements.progressRing.style.strokeDashoffset = offset;

  if (progress >= 1) {
    // Burn complete
    completeBurn();
    return;
  }

  state.animationFrame = requestAnimationFrame(updateHoldProgress);
}

function endHold() {
  if (!state.isHolding) return;

  state.isHolding = false;
  elements.burnButton.classList.remove('pressing');

  // Cancel animation
  if (state.animationFrame) {
    cancelAnimationFrame(state.animationFrame);
  }

  // Reset progress ring
  elements.progressRing.style.strokeDashoffset = 283;

  // Stop fire
  if (fireSystem) {
    fireSystem.stop();
  }
}

function completeBurn() {
  state.isHolding = false;
  elements.burnButton.classList.remove('pressing');

  // Start letter burning animation
  elements.letter.classList.add('burning');

  // Intensify fire briefly
  setTimeout(() => {
    if (fireSystem) {
      fireSystem.stop();
    }

    // Transition to reply after burn animation
    setTimeout(() => {
      transitionToReply();
    }, 1500);
  }, 1000);

  // V1.2: 保存信件到 Supabase (异步，不阻塞流程)
  saveLetterToSupabase();
}

// V1.2: 保存信件到 Supabase
async function saveLetterToSupabase() {
  // 根据 persona 和内容推测情绪
  const emotionMap = {
    gentle: 'gratitude',
    strict: 'release',
    playful: 'love',
    regretful: 'regret'
  };

  const emotion = emotionMap[state.persona] || 'release';
  const recipient = state.recipient || '某人';

  try {
    await supabase.insertLetter(recipient, emotion);
    console.log('✨ 信件已记录到余烬星空');
  } catch (error) {
    console.warn('Failed to save letter:', error);
    // 不影响主流程
  }
}

// ============================================
// Event Listeners
// ============================================
function initEventListeners() {
  // Character count
  elements.messageInput.addEventListener('input', () => {
    elements.charCount.textContent = elements.messageInput.value.length;

    // Auto-transition when user starts typing
    if (elements.messageInput.value.length >= 10 && state.phase === 'input') {
      // Show burn button hint
    }
  });

  // Enter to continue (with shift for newline)
  elements.messageInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      transitionToCremate();
    }
  });

  // Submit button click
  elements.submitButton.addEventListener('click', () => {
    transitionToCremate();
  });

  // Burn button interactions
  elements.burnButton.addEventListener('pointerdown', startHold);
  elements.burnButton.addEventListener('pointerup', endHold);
  elements.burnButton.addEventListener('pointerleave', endHold);
  elements.burnButton.addEventListener('pointercancel', endHold);

  // Touch events for mobile
  elements.burnButton.addEventListener('touchstart', startHold, { passive: false });
  elements.burnButton.addEventListener('touchend', endHold);
  elements.burnButton.addEventListener('touchcancel', endHold);

  // Restart button
  elements.restartButton.addEventListener('click', restart);

  // V1.1: Persona chip selection
  if (elements.personaChips) {
    elements.personaChips.addEventListener('click', (e) => {
      const chip = e.target.closest('.persona-chip');
      if (!chip) return;

      // Toggle selection
      const wasActive = chip.classList.contains('active');
      document.querySelectorAll('.persona-chip').forEach(c => c.classList.remove('active'));

      if (!wasActive) {
        chip.classList.add('active');
        state.persona = chip.dataset.persona;
      } else {
        state.persona = null;
      }
    });
  }

  // V1.1: Share button
  if (elements.shareButton) {
    elements.shareButton.addEventListener('click', openShareModal);
  }

  // V1.1: Modal close
  if (elements.modalClose) {
    elements.modalClose.addEventListener('click', closeShareModal);
  }

  // V1.1: Download button
  if (elements.downloadButton) {
    elements.downloadButton.addEventListener('click', downloadShareCard);
  }

  // Close modal on backdrop click
  if (elements.shareModal) {
    elements.shareModal.addEventListener('click', (e) => {
      if (e.target === elements.shareModal) {
        closeShareModal();
      }
    });
  }
}

// ============================================
// Initialize
// ============================================
function init() {
  // Initialize Ember Sky (V1.2) - replaces AmbientParticles
  try {
    new EmberSky(elements.ambientCanvas, elements.emberTooltip);
    console.log('✨ 余烬星空已启动');
  } catch (error) {
    // Fallback to simple ambient particles
    console.warn('EmberSky failed, using fallback:', error);
    new AmbientParticles(elements.ambientCanvas);
  }

  // Initialize event listeners
  initEventListeners();

  // Focus on input
  elements.messageInput.focus();

  console.log('🔥 未发送信件焚烧炉已启动');
}

// Start when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
