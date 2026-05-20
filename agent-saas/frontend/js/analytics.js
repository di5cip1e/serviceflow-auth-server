/**
 * M.ai.K.R Analytics Helper
 * Wrapper around Umami analytics with graceful fallback
 * Configure in analytics-config.json
 */
(function() {
  'use strict';

  var analyticsEnabled = false;

  // Load config
  fetch('/analytics-config.json')
    .then(r => r.json())
    .then(cfg => {
      analyticsEnabled = cfg.enabled && cfg.site_id && cfg.site_id !== 'YOUR_SITE_ID_HERE';
    })
    .catch(() => { analyticsEnabled = false; });

  window.maikrAnalytics = {
    track: function(eventName, data) {
      if (analyticsEnabled && window.umami) {
        window.umami.track(eventName, data);
      } else {
        console.log('[Analytics]', eventName, data || '');
      }
    },
    trackPage: function(pageName) {
      this.track('page_view', { page: pageName });
    }
  };
})();
