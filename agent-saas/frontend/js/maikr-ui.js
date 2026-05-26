/**
 * M.ai.K.R — Shared UI Utilities
 * Works with maikr-v3.css design system
 * No dependencies. Vanilla JS.
 */
(function(global) {
  'use strict';

  /* ── Toast Notifications ── */
  var toastContainer = null;
  function ensureContainer() {
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.className = 'toast-container';
      document.body.appendChild(toastContainer);
    }
    return toastContainer;
  }

  function toast(message, type, duration) {
    type = type || 'info';
    duration = duration || 4000;
    var container = ensureContainer();
    var icons = { success: '✓', error: '✕', warning: '⚠', info: 'ℹ' };
    var el = document.createElement('div');
    el.className = 'toast toast-' + type;
    el.innerHTML = '<span class="toast-icon">' + (icons[type] || 'ℹ') + '</span><span>' + message + '</span><button class="toast-close">&times;</button>';
    el.querySelector('.toast-close').addEventListener('click', function() { remove(); });
    container.appendChild(el);
    var timer = setTimeout(remove, duration);
    function remove() {
      clearTimeout(timer);
      if (el.parentNode) {
        el.style.opacity = '0';
        el.style.transform = 'translateX(40px)';
        el.style.transition = 'all 200ms ease';
        setTimeout(function() { if (el.parentNode) el.parentNode.removeChild(el); }, 200);
      }
    }
  }

  global.MaikrToast = {
    success: function(m, d) { toast(m, 'success', d); },
    error: function(m, d) { toast(m, 'error', d); },
    warning: function(m, d) { toast(m, 'warning', d); },
    info: function(m, d) { toast(m, 'info', d); }
  };

  /* ── Auth Check ── */
  function checkAuth(redirectUrl) {
    redirectUrl = redirectUrl || '/login.html';
    return fetch('/api/auth/me', { credentials: 'include' })
      .then(function(res) {
        if (res.status === 401 || res.status === 403) {
          window.location.href = redirectUrl;
          return Promise.reject(new Error('Not authenticated'));
        }
        return res.json();
      })
      .then(function(data) {
        if (data && data.user) {
          // Update sidebar user info if present
          var nameEl = document.getElementById('sidebarName');
          var emailEl = document.getElementById('sidebarEmail');
          var avatarEl = document.getElementById('sidebarAvatar');
          if (nameEl) nameEl.textContent = data.user.name || 'User';
          if (emailEl) emailEl.textContent = data.user.email || '';
          if (avatarEl && data.user.name) avatarEl.textContent = data.user.name.charAt(0).toUpperCase();
        }
        return data;
      });
  }

  global.MaikrAuth = { check: checkAuth };

  /* ── Modal ── */
  function openModal(html) {
    var existing = document.querySelector('.modal-overlay');
    if (existing) existing.remove();
    var overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    var modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = html;
    overlay.appendChild(modal);
    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) overlay.remove();
    });
    document.body.appendChild(overlay);
    return {
      el: modal,
      close: function() { overlay.remove(); },
      find: function(sel) { return modal.querySelector(sel); }
    };
  }

  global.MaikrModal = { open: openModal };

  /* ── Loading Skeleton ── */
  function skeleton(container, type) {
    type = type || 'card';
    container = typeof container === 'string' ? document.querySelector(container) : container;
    if (!container) return;
    if (type === 'card') {
      container.innerHTML = '<div class="skeleton skeleton-card"></div>';
    } else if (type === 'text') {
      container.innerHTML = '<div class="skeleton skeleton-heading"></div>' + 
        '<div class="skeleton skeleton-text"></div>'.repeat(3);
    } else if (type === 'stats') {
      container.innerHTML = '<div class="stat-grid">' +
        '<div class="stat-card card"><div class="skeleton skeleton-heading"></div><div class="skeleton skeleton-text"></div></div>'.repeat(3) +
        '</div>';
    }
  }

  global.MaikrSkeleton = { load: skeleton };

  /* ── Formatting ── */
  function formatNum(n) {
    if (n == null) return '0';
    n = Number(n);
    if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
    if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
    return n.toString();
  }

  function formatDate(iso) {
    if (!iso) return '—';
    var d = new Date(iso);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' });
  }

  function timeAgo(iso) {
    if (!iso) return '—';
    var seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return Math.floor(seconds / 60) + 'm ago';
    if (seconds < 86400) return Math.floor(seconds / 3600) + 'h ago';
    return Math.floor(seconds / 86400) + 'd ago';
  }

  global.MaikrFmt = { num: formatNum, date: formatDate, ago: timeAgo };

  /* ── API Helpers ── */
  function apiGet(url) {
    return fetch(url, { credentials: 'include' })
      .then(function(r) {
        if (!r.ok) return r.json().then(function(e) { throw new Error(e.error || 'Request failed (' + r.status + ')'); });
        return r.json();
      });
  }

  function apiPost(url, body) {
    return fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(body || {})
    }).then(function(r) {
      if (!r.ok) return r.json().then(function(e) { throw new Error(e.error || 'Request failed (' + r.status + ')'); });
      return r.json();
    });
  }

  global.MaikrAPI = { get: apiGet, post: apiPost };

  /* ── Page Loader ── */
  function showPageLoader(text) {
    var loader = document.createElement('div');
    loader.className = 'page-loader';
    loader.id = 'maikrPageLoader';
    loader.innerHTML = '<div class="spinner spinner-lg"></div><div class="loader-text">' + (text || 'Loading…') + '</div>';
    document.body.appendChild(loader);
  }

  function hidePageLoader() {
    var el = document.getElementById('maikrPageLoader');
    if (el) {
      el.style.opacity = '0';
      el.style.transition = 'opacity 300ms ease';
      setTimeout(function() { if (el.parentNode) el.parentNode.removeChild(el); }, 300);
    }
  }

  global.MaikrLoader = { show: showPageLoader, hide: hidePageLoader };

  /* ── Sidebar Active State ── */
  function setActiveSidebar() {
    var current = window.location.pathname.replace(/\/$/, '') || '/command-center.html';
    var links = document.querySelectorAll('.app-sidebar-nav a');
    links.forEach(function(a) {
      var href = a.getAttribute('href') || '';
      a.classList.toggle('active', href.endsWith(current) || current.endsWith(href.split('/').pop()));
    });
  }

  /* ── Animate elements in view ── */
  function animateInView() {
    var els = document.querySelectorAll('.animate-in');
    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.style.animationPlayState = 'running';
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    els.forEach(function(el) {
      el.style.animationPlayState = 'paused';
      observer.observe(el);
    });
  }

  // Run sidebar and animations on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() { setActiveSidebar(); animateInView(); });
  } else {
    setActiveSidebar();
    animateInView();
  }

})(window);
