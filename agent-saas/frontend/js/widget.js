/**
 * M.ai.K.R — Public Widget Loader
 * Embed this script on any website to add an AI chat widget.
 * Usage: <script src="https://maikr.pro/js/widget.js" data-agent="AGENT_ID" async></script>
 */
(function() {
  'use strict';

  var configs = [];
  var scripts = document.querySelectorAll('script[src*="widget.js"]');
  scripts.forEach(function(s) {
    var agentId = s.getAttribute('data-agent');
    var widgetId = s.getAttribute('data-widget') || 'wg-' + Math.random().toString(36).slice(2,10);
    var configB64 = s.getAttribute('data-config') || '';
    var mode = s.getAttribute('data-mode') || 'bubble';
    var channel = s.getAttribute('data-channel') || 'web';

    var config = {};
    try { config = JSON.parse(atob(configB64)); } catch(e) {}

    if (agentId) configs.push({ agentId: agentId, widgetId: widgetId, config: config, mode: mode, channel: channel });
  });

  if (configs.length === 0) return;

  // Load widget CSS
  var css = document.createElement('link');
  css.rel = 'stylesheet';
  css.href = 'https://maikr.pro/css/widget.css';
  document.head.appendChild(css);

  configs.forEach(function(cfg) {
    initWidget(cfg);
  });

  function initWidget(cfg) {
    var container = document.getElementById('maikr-widget-' + cfg.widgetId);
    var isOpen = false;
    var messages = [];
    var loading = false;

    // Create bubble button
    var bubble = document.createElement('button');
    bubble.id = 'maikr-bubble-' + cfg.widgetId;
    bubble.innerHTML = '💬';
    bubble.style.cssText = 'position:fixed;bottom:24px;right:24px;width:56px;height:56px;border-radius:50%;border:none;background:var(--maikr-primary,#10b981);color:white;font-size:24px;cursor:pointer;box-shadow:0 4px 12px rgba(0,0,0,0.3);z-index:99999;transition:transform 0.2s,box-shadow 0.2s;display:flex;align-items:center;justify-content:center;';
    bubble.setAttribute('aria-label', 'Open AI Chat');
    bubble.onmouseenter = function() { bubble.style.transform = 'scale(1.1)'; };
    bubble.onmouseleave = function() { bubble.style.transform = 'scale(1)'; };

    // Create chat panel
    var panel = document.createElement('div');
    panel.id = 'maikr-panel-' + cfg.widgetId;
    panel.style.cssText = 'position:fixed;bottom:90px;right:24px;width:380px;height:520px;background:#fff;border-radius:16px;box-shadow:0 8px 32px rgba(0,0,0,0.2);z-index:99999;display:none;flex-direction:column;overflow:hidden;font-family:Inter,-apple-system,sans-serif;';

    // Header
    var header = document.createElement('div');
    header.style.cssText = 'background:linear-gradient(135deg,#0f172a,#1e293b);color:white;padding:16px 20px;display:flex;align-items:center;justify-content:space-between;';
    header.innerHTML = '<div><div style="font-weight:700;font-size:15px;">' + (cfg.config.agentName || 'AI Assistant') + '</div><div style="font-size:11px;opacity:0.7;margin-top:2px;">Powered by M.ai.K.R</div></div>';
    var closeBtn = document.createElement('button');
    closeBtn.innerHTML = '✕';
    closeBtn.style.cssText = 'background:none;border:none;color:white;font-size:18px;cursor:pointer;padding:4px;opacity:0.7;';
    closeBtn.onclick = function() { isOpen = false; panel.style.display = 'none'; };
    header.appendChild(closeBtn);

    // Messages area
    var msgsDiv = document.createElement('div');
    msgsDiv.style.cssText = 'flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:8px;background:#f8fafc;';

    // Welcome message
    var welcomeMsg = document.createElement('div');
    welcomeMsg.style.cssText = 'background:white;border-radius:12px;padding:12px 14px;font-size:14px;color:#334155;max-width:80%;align-self:flex-start;box-shadow:0 1px 3px rgba(0,0,0,0.08);';
    welcomeMsg.textContent = cfg.config.welcomeMessage || 'Hi! How can I help you today?';
    msgsDiv.appendChild(welcomeMsg);

    // Input area
    var inputDiv = document.createElement('div');
    inputDiv.style.cssText = 'padding:12px 16px;border-top:1px solid #e2e8f0;display:flex;gap:8px;background:white;';
    inputDiv.innerHTML = '<input type="text" placeholder="Type a message…" style="flex:1;padding:10px 14px;border:1px solid #e2e8f0;border-radius:20px;font-size:14px;font-family:inherit;outline:none;" /><button class="maikr-send" style="width:40px;height:40px;border-radius:50%;background:#10b981;color:white;border:none;font-size:16px;cursor:pointer;">➤</button>';
    var input = inputDiv.querySelector('input');
    var sendBtn = inputDiv.querySelector('.maikr-send');

    // Assemble
    panel.appendChild(header);
    panel.appendChild(msgsDiv);
    panel.appendChild(inputDiv);

    if (cfg.mode === 'inline' && container) {
      // Inline mode: embed directly in the container
      container.style.cssText = 'width:100%;height:520px;border-radius:16px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,0.1);';
      container.appendChild(panel);
      panel.style.cssText = 'width:100%;height:100%;display:flex;flex-direction:column;border-radius:16px;overflow:hidden;font-family:Inter,-apple-system,sans-serif;position:relative;bottom:auto;right:auto;';
    } else {
      // Bubble mode
      document.body.appendChild(bubble);
      document.body.appendChild(panel);

      bubble.onclick = function() {
        if (panel.style.display === 'flex') {
          panel.style.display = 'none';
        } else {
          panel.style.display = 'flex';
          input.focus();
        }
      };
    }

    // Send message handler
    function sendMessage() {
      var text = input.value.trim();
      if (!text || loading) return;
      input.value = '';

      // Add user message
      var userMsg = document.createElement('div');
      userMsg.style.cssText = 'background:#10b981;color:white;border-radius:12px;padding:10px 14px;font-size:14px;max-width:80%;align-self:flex-end;word-wrap:break-word;';
      userMsg.textContent = text;
      msgsDiv.appendChild(userMsg);
      msgsDiv.scrollTop = msgsDiv.scrollHeight;

      // Show typing indicator
      loading = true;
      var typing = document.createElement('div');
      typing.className = 'maikr-typing';
      typing.style.cssText = 'background:white;border-radius:12px;padding:10px 14px;font-size:14px;color:#64748b;align-self:flex-start;box-shadow:0 1px 3px rgba(0,0,0,0.08);';
      typing.textContent = '●●●';
      msgsDiv.appendChild(typing);
      msgsDiv.scrollTop = msgsDiv.scrollHeight;

      // Call API
      fetch('https://maikr.pro/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId: cfg.agentId, message: text })
      })
      .then(function(r) { return r.json(); })
      .then(function(data) {
        msgsDiv.removeChild(typing);
        loading = false;

        var reply = document.createElement('div');
        reply.style.cssText = 'background:white;border-radius:12px;padding:12px 14px;font-size:14px;color:#334155;max-width:80%;align-self:flex-start;box-shadow:0 1px 3px rgba(0,0,0,0.08);word-wrap:break-word;white-space:pre-wrap;';
        reply.textContent = data.reply || data.error || 'Sorry, something went wrong. Please try again.';
        msgsDiv.appendChild(reply);
        msgsDiv.scrollTop = msgsDiv.scrollHeight;
      })
      .catch(function() {
        msgsDiv.removeChild(typing);
        loading = false;
        var errMsg = document.createElement('div');
        errMsg.style.cssText = 'background:#fee2e2;border-radius:12px;padding:10px 14px;font-size:14px;color:#dc2626;align-self:flex-start;';
        errMsg.textContent = 'Connection error. Please try again.';
        msgsDiv.appendChild(errMsg);
      });
    }

    sendBtn.onclick = sendMessage;
    input.addEventListener('keydown', function(e) { if (e.key === 'Enter') sendMessage(); });
  }
})();
