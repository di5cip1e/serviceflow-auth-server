/**
 * MessageFeed.js
 * 
 * Manages a scrollable message feed for all game notifications.
 * Mobile-friendly with touch controls and collapsible design.
 */

export class MessageFeed {
  constructor() {
    this.container = document.getElementById('messageFeed');
    this.header = this.container.querySelector('.feed-header');
    this.messagesContainer = this.container.querySelector('.feed-messages');
    this.toggle = this.container.querySelector('.feed-toggle');
    
    this.messages = [];
    this.maxMessages = 50; // Keep last 50 messages
    this.unreadCount = 0;
    this.isCollapsed = false;
    
    this.setupEventListeners();
  }
  
  setupEventListeners() {
    // Toggle collapse on header tap/click
    this.header.addEventListener('click', () => {
      this.toggleCollapse();
    });
    
    // Mark messages as read when scrolling
    this.messagesContainer.addEventListener('scroll', () => {
      this.markVisibleAsRead();
    });
  }
  
  toggleCollapse() {
    this.isCollapsed = !this.isCollapsed;
    
    if (this.isCollapsed) {
      this.container.classList.add('collapsed');
      this.updateUnreadBadge();
    } else {
      this.container.classList.remove('collapsed');
      // Mark all as read when opening
      setTimeout(() => {
        this.markAllAsRead();
      }, 300);
    }
  }
  
  /**
   * Add a message to the feed
   * @param {Object} messageData - { title, description, type, tokens, timestamp }
   */
  addMessage(messageData) {
    const {
      title,
      description,
      type = 'info', // 'mistake', 'battle', 'success', 'warning', 'info'
      tokens = null,
      timestamp = Date.now()
    } = messageData;
    
    const message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title,
      description,
      type,
      tokens,
      timestamp,
      read: false
    };
    
    this.messages.unshift(message); // Add to beginning
    
    // Trim old messages
    if (this.messages.length > this.maxMessages) {
      this.messages = this.messages.slice(0, this.maxMessages);
    }
    
    // Increment unread count
    this.unreadCount++;
    
    // Render the new message
    this.renderMessage(message);
    
    // Update unread badge if collapsed
    if (this.isCollapsed) {
      this.updateUnreadBadge();
    }
    
    // Auto-scroll to top (new messages)
    this.messagesContainer.scrollTop = 0;
  }
  
  renderMessage(message) {
    const messageEl = document.createElement('div');
    messageEl.className = `feed-message ${message.type} ${message.read ? '' : 'unread'}`;
    messageEl.dataset.messageId = message.id;
    
    const timeAgo = this.getTimeAgo(message.timestamp);
    
    messageEl.innerHTML = `
      <div class="message-header">
        <div class="message-title">${message.title}</div>
        ${message.tokens ? `<div class="message-tokens">+${message.tokens} 🗡️</div>` : ''}
      </div>
      <div class="message-description">${message.description}</div>
      <div class="message-time">${timeAgo}</div>
    `;
    
    // Add tap interaction
    messageEl.addEventListener('click', () => {
      this.markMessageAsRead(message.id);
    });
    
    // Insert at the top
    this.messagesContainer.insertBefore(messageEl, this.messagesContainer.firstChild);
  }
  
  markMessageAsRead(messageId) {
    const message = this.messages.find(m => m.id === messageId);
    if (message && !message.read) {
      message.read = true;
      this.unreadCount = Math.max(0, this.unreadCount - 1);
      
      const messageEl = this.messagesContainer.querySelector(`[data-message-id="${messageId}"]`);
      if (messageEl) {
        messageEl.classList.remove('unread');
      }
      
      this.updateUnreadBadge();
    }
  }
  
  markVisibleAsRead() {
    const containerRect = this.messagesContainer.getBoundingClientRect();
    const messageElements = this.messagesContainer.querySelectorAll('.feed-message.unread');
    
    messageElements.forEach(el => {
      const rect = el.getBoundingClientRect();
      // Check if at least 50% of message is visible
      const isVisible = rect.top < containerRect.bottom && rect.bottom > containerRect.top;
      
      if (isVisible) {
        const messageId = el.dataset.messageId;
        this.markMessageAsRead(messageId);
      }
    });
  }
  
  markAllAsRead() {
    this.messages.forEach(m => m.read = true);
    this.unreadCount = 0;
    
    const unreadElements = this.messagesContainer.querySelectorAll('.feed-message.unread');
    unreadElements.forEach(el => el.classList.remove('unread'));
    
    this.updateUnreadBadge();
  }
  
  updateUnreadBadge() {
    // Remove existing badge
    const existingBadge = this.container.querySelector('.feed-unread');
    if (existingBadge) {
      existingBadge.remove();
    }
    
    // Add new badge if there are unread messages and feed is collapsed
    if (this.unreadCount > 0 && this.isCollapsed) {
      const badge = document.createElement('div');
      badge.className = 'feed-unread';
      badge.textContent = this.unreadCount > 99 ? '99+' : this.unreadCount;
      this.container.appendChild(badge);
    }
  }
  
  getTimeAgo(timestamp) {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    
    if (seconds < 5) return 'just now';
    if (seconds < 60) return `${seconds}s ago`;
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }
  
  /**
   * Clear all messages
   */
  clear() {
    this.messages = [];
    this.unreadCount = 0;
    this.messagesContainer.innerHTML = '';
    this.updateUnreadBadge();
  }
  
  /**
   * Get all messages of a specific type
   */
  getMessagesByType(type) {
    return this.messages.filter(m => m.type === type);
  }
}
