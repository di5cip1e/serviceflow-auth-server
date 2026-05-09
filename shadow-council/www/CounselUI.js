export class CounselUI {
  constructor(worldManager, onAdvice) {
    this.worldManager = worldManager;
    this.onAdvice = onAdvice;
    this.isOpen = false;
    this.messageHistory = [];
    
    this.container = null;
    this.overlay = null;
    this.messagesContainer = null;
    this.inputField = null;
    
    this.init();
  }
  
  init() {
    // Create counsel button (floating action button)
    this.createCounselButton();
    
    // Create message overlay (hidden by default)
    this.createMessageOverlay();
  }
  
  createCounselButton() {
    const button = document.createElement('button');
    button.id = 'counsel-fab';
    button.innerHTML = '💬';
    button.style.cssText = `
      position: fixed;
      bottom: 100px;
      right: 20px;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: linear-gradient(135deg, rgba(120, 90, 60, 0.95), rgba(160, 120, 80, 0.9));
      border: 3px solid rgba(200, 150, 90, 0.8);
      color: #fff;
      font-size: 1.8rem;
      cursor: pointer;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.6);
      z-index: 100;
      transition: all 0.3s ease;
      pointer-events: all;
    `;
    
    button.addEventListener('click', () => this.toggle());
    
    button.addEventListener('mouseenter', () => {
      button.style.transform = 'scale(1.1)';
      button.style.boxShadow = '0 6px 30px rgba(200, 150, 90, 0.6)';
    });
    
    button.addEventListener('mouseleave', () => {
      button.style.transform = 'scale(1)';
      button.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.6)';
    });
    
    document.body.appendChild(button);
  }
  
  createMessageOverlay() {
    // Dark overlay background
    this.overlay = document.createElement('div');
    this.overlay.id = 'counsel-overlay';
    this.overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      z-index: 200;
      display: none;
      opacity: 0;
      transition: opacity 0.3s ease;
      pointer-events: all;
    `;
    
    // Message container
    this.container = document.createElement('div');
    this.container.id = 'counsel-container';
    this.container.style.cssText = `
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      max-width: 600px;
      margin: 0 auto;
      height: 70%;
      max-height: 600px;
      background: linear-gradient(135deg, rgba(20, 15, 25, 0.98), rgba(35, 25, 40, 0.98));
      border: 2px solid rgba(180, 140, 80, 0.6);
      border-radius: 12px 12px 0 0;
      display: flex;
      flex-direction: column;
      transform: translateY(100%);
      transition: transform 0.3s ease;
      box-shadow: 0 -4px 30px rgba(0, 0, 0, 0.8);
    `;
    
    // Header
    const header = document.createElement('div');
    header.style.cssText = `
      padding: 1rem 1.5rem;
      background: rgba(80, 60, 40, 0.3);
      border-bottom: 2px solid rgba(180, 140, 80, 0.4);
      display: flex;
      justify-content: space-between;
      align-items: center;
    `;
    
    const playerNation = this.worldManager.getPlayerNation();
    header.innerHTML = `
      <div>
        <div style="font-family: 'Cinzel', serif; font-size: 1.2rem; color: #c9a86a;">
          Counsel to ${playerNation.ruler.name}
        </div>
        <div style="font-size: 0.85rem; color: #a89070; margin-top: 0.2rem;">
          ${playerNation.name}
        </div>
      </div>
      <button id="close-counsel" style="
        background: transparent;
        border: none;
        color: #a89070;
        font-size: 1.5rem;
        cursor: pointer;
        padding: 0.5rem;
        line-height: 1;
        transition: color 0.2s;
      ">✕</button>
    `;
    
    // Messages area (scrollable)
    this.messagesContainer = document.createElement('div');
    this.messagesContainer.id = 'messages-container';
    this.messagesContainer.style.cssText = `
      flex: 1;
      overflow-y: auto;
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    `;
    
    // Input area
    const inputArea = document.createElement('div');
    inputArea.style.cssText = `
      padding: 1rem;
      background: rgba(20, 15, 25, 0.6);
      border-top: 2px solid rgba(180, 140, 80, 0.4);
      display: flex;
      gap: 0.75rem;
      align-items: flex-end;
    `;
    
    this.inputField = document.createElement('textarea');
    this.inputField.id = 'counsel-input';
    this.inputField.placeholder = 'Offer your counsel...';
    this.inputField.style.cssText = `
      flex: 1;
      min-height: 60px;
      max-height: 120px;
      padding: 0.75rem;
      background: rgba(40, 30, 50, 0.8);
      border: 2px solid rgba(150, 110, 70, 0.5);
      border-radius: 6px;
      color: #e8d4a8;
      font-size: 1rem;
      font-family: 'Crimson Pro', serif;
      resize: none;
      transition: all 0.3s ease;
    `;
    
    this.inputField.addEventListener('focus', () => {
      this.inputField.style.borderColor = 'rgba(200, 150, 90, 0.8)';
      this.inputField.style.background = 'rgba(50, 35, 60, 0.9)';
    });
    
    this.inputField.addEventListener('blur', () => {
      this.inputField.style.borderColor = 'rgba(150, 110, 70, 0.5)';
      this.inputField.style.background = 'rgba(40, 30, 50, 0.8)';
    });
    
    // Auto-resize textarea
    this.inputField.addEventListener('input', () => {
      this.inputField.style.height = 'auto';
      this.inputField.style.height = Math.min(this.inputField.scrollHeight, 120) + 'px';
    });
    
    const sendButton = document.createElement('button');
    sendButton.id = 'send-counsel';
    sendButton.innerHTML = '➤';
    sendButton.style.cssText = `
      width: 50px;
      height: 50px;
      background: linear-gradient(135deg, rgba(120, 90, 60, 0.9), rgba(160, 120, 80, 0.8));
      border: 2px solid rgba(200, 150, 90, 0.8);
      border-radius: 8px;
      color: #e8d4a8;
      font-size: 1.3rem;
      cursor: pointer;
      transition: all 0.2s ease;
      flex-shrink: 0;
    `;
    
    sendButton.addEventListener('click', () => this.sendAdvice());
    
    sendButton.addEventListener('mouseenter', () => {
      sendButton.style.transform = 'scale(1.05)';
      sendButton.style.boxShadow = '0 4px 15px rgba(200, 150, 90, 0.4)';
    });
    
    sendButton.addEventListener('mouseleave', () => {
      sendButton.style.transform = 'scale(1)';
      sendButton.style.boxShadow = 'none';
    });
    
    // Enter to send
    this.inputField.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendAdvice();
      }
    });
    
    inputArea.appendChild(this.inputField);
    inputArea.appendChild(sendButton);
    
    // Assemble
    this.container.appendChild(header);
    this.container.appendChild(this.messagesContainer);
    this.container.appendChild(inputArea);
    
    this.overlay.appendChild(this.container);
    document.body.appendChild(this.overlay);
    
    // Close button
    header.querySelector('#close-counsel').addEventListener('click', () => this.close());
    
    // Click overlay to close
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) this.close();
    });
    
    // Add initial greeting
    this.addSystemMessage('greeting');
  }
  
  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }
  
  open() {
    this.isOpen = true;
    this.overlay.style.display = 'block';
    
    // Trigger animations
    setTimeout(() => {
      this.overlay.style.opacity = '1';
      this.container.style.transform = 'translateY(0)';
    }, 10);
    
    // Focus input
    setTimeout(() => {
      this.inputField.focus();
    }, 350);
  }
  
  close() {
    this.isOpen = false;
    this.overlay.style.opacity = '0';
    this.container.style.transform = 'translateY(100%)';
    
    setTimeout(() => {
      this.overlay.style.display = 'none';
    }, 300);
  }
  
  addSystemMessage(type) {
    const playerNation = this.worldManager.getPlayerNation();
    let message = '';
    
    if (type === 'greeting') {
      const pronouns = playerNation.ruler.gender === 'male' ? 'He' : 
                       playerNation.ruler.gender === 'female' ? 'She' : 'They';
      const verb = playerNation.ruler.gender === 'non-binary' ? 'await' : 'awaits';
      
      message = `${playerNation.ruler.name} ${verb} your counsel. ${pronouns} will consider your advice based on ${playerNation.ruler.gender === 'non-binary' ? 'their' : pronouns.toLowerCase() === 'he' ? 'his' : 'her'} personality and the current state of the realm.`;
    }
    
    const messageEl = document.createElement('div');
    messageEl.style.cssText = `
      padding: 0.75rem 1rem;
      background: rgba(80, 60, 40, 0.2);
      border-left: 3px solid #c9a86a;
      border-radius: 6px;
      color: #b4a088;
      font-size: 0.9rem;
      font-style: italic;
      line-height: 1.5;
    `;
    messageEl.textContent = message;
    
    this.messagesContainer.appendChild(messageEl);
    this.scrollToBottom();
  }
  
  addPlayerMessage(text) {
    const messageEl = document.createElement('div');
    messageEl.style.cssText = `
      align-self: flex-end;
      max-width: 80%;
      padding: 0.75rem 1rem;
      background: linear-gradient(135deg, rgba(60, 45, 70, 0.7), rgba(80, 60, 90, 0.6));
      border: 1px solid rgba(150, 110, 70, 0.4);
      border-radius: 12px 12px 0 12px;
      color: #d4c5a9;
      font-size: 1rem;
      line-height: 1.4;
    `;
    
    messageEl.innerHTML = `
      <div style="font-size: 0.75rem; color: #a89070; margin-bottom: 0.3rem;">Your Counsel</div>
      <div>${this.escapeHtml(text)}</div>
    `;
    
    this.messagesContainer.appendChild(messageEl);
    this.messageHistory.push({ type: 'player', text, timestamp: Date.now() });
    this.scrollToBottom();
  }
  
  addRulerMessage(text, accepted, threatened = false) {
    const messageEl = document.createElement('div');
    messageEl.style.cssText = `
      align-self: flex-start;
      max-width: 80%;
      padding: 0.75rem 1rem;
      background: linear-gradient(135deg, rgba(80, 60, 40, 0.7), rgba(120, 90, 60, 0.6));
      border: 1px solid rgba(200, 150, 90, 0.5);
      border-radius: 12px 12px 12px 0;
      color: #e8d4a8;
      font-size: 1rem;
      line-height: 1.4;
    `;
    
    const playerNation = this.worldManager.getPlayerNation();
    const statusColor = accepted ? '#6ac96a' : '#c96a6a';
    const statusText = threatened ? '⚔ Threatened' : (accepted ? '✓ Accepted' : '✗ Rejected');
    
    messageEl.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.3rem;">
        <div style="font-size: 0.75rem; color: #c9a86a;">${playerNation.ruler.name}</div>
        <div style="font-size: 0.75rem; color: ${statusColor}; font-weight: 700;">${statusText}</div>
      </div>
      <div>${this.escapeHtml(text)}</div>
    `;
    
    this.messagesContainer.appendChild(messageEl);
    this.messageHistory.push({ 
      type: 'ruler', 
      text, 
      accepted, 
      threatened,
      timestamp: Date.now() 
    });
    this.scrollToBottom();
  }
  
  addThinkingMessage() {
    const messageEl = document.createElement('div');
    messageEl.id = 'thinking-message';
    messageEl.style.cssText = `
      align-self: flex-start;
      max-width: 80%;
      padding: 0.75rem 1rem;
      background: linear-gradient(135deg, rgba(80, 60, 40, 0.5), rgba(120, 90, 60, 0.4));
      border: 1px solid rgba(200, 150, 90, 0.3);
      border-radius: 12px 12px 12px 0;
      color: #b4a088;
      font-size: 0.9rem;
      font-style: italic;
    `;
    
    messageEl.innerHTML = `
      <div style="display: flex; align-items: center; gap: 0.5rem;">
        <div class="thinking-dots">
          <span style="animation: blink 1.4s infinite; animation-delay: 0s;">●</span>
          <span style="animation: blink 1.4s infinite; animation-delay: 0.2s;">●</span>
          <span style="animation: blink 1.4s infinite; animation-delay: 0.4s;">●</span>
        </div>
        <span>Considering your counsel...</span>
      </div>
    `;
    
    this.messagesContainer.appendChild(messageEl);
    this.scrollToBottom();
    
    // Add blinking animation
    if (!document.getElementById('thinking-animation-style')) {
      const style = document.createElement('style');
      style.id = 'thinking-animation-style';
      style.textContent = `
        @keyframes blink {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
        .thinking-dots span {
          display: inline-block;
        }
      `;
      document.head.appendChild(style);
    }
  }
  
  removeThinkingMessage() {
    const thinking = document.getElementById('thinking-message');
    if (thinking) thinking.remove();
  }
  
  async sendAdvice() {
    const text = this.inputField.value.trim();
    if (!text) return;
    
    // Add player message
    this.addPlayerMessage(text);
    
    // Clear input
    this.inputField.value = '';
    this.inputField.style.height = 'auto';
    
    // Disable input while processing
    this.inputField.disabled = true;
    document.getElementById('send-counsel').disabled = true;
    
    // Show thinking
    this.addThinkingMessage();
    
    // Send to callback
    await this.onAdvice(text);
    
    // Re-enable input
    this.inputField.disabled = false;
    document.getElementById('send-counsel').disabled = false;
    this.removeThinkingMessage();
    this.inputField.focus();
  }
  
  scrollToBottom() {
    setTimeout(() => {
      this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }, 10);
  }
  
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
  
  /**
   * Set diplomacy mode - update UI to show we're talking to a rival ruler
   */
  setDiplomacyMode(nation) {
    const header = this.container.querySelector('div');
    
    if (nation) {
      // Update header to show rival ruler
      header.querySelector('div:first-child').innerHTML = `
        <div style="font-family: 'Cinzel', serif; font-size: 1.2rem; color: #c9a86a;">
          Emissary to ${nation.ruler.name}
        </div>
        <div style="font-size: 0.85rem; color: #a89070; margin-top: 0.2rem;">
          ${nation.name}
        </div>
      `;
      
      this.inputField.placeholder = 'Make your proposal...';
      
      // Clear previous messages when switching to diplomacy
      this.messagesContainer.innerHTML = '';
      this.messageHistory = [];
    } else {
      // Return to counsel mode
      const playerNation = this.worldManager.getPlayerNation();
      header.querySelector('div:first-child').innerHTML = `
        <div style="font-family: 'Cinzel', serif; font-size: 1.2rem; color: #c9a86a;">
          Counsel to ${playerNation.ruler.name}
        </div>
        <div style="font-size: 0.85rem; color: #a89070; margin-top: 0.2rem;">
          ${playerNation.name}
        </div>
      `;
      
      this.inputField.placeholder = 'Offer your counsel...';
    }
  }
}
